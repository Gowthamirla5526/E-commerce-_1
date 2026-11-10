import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { reserveBatchStock, commitStockReservation } from "@/modules/inventory/reservation";

const orderCreateSchema = z.object({
  addressId: z.string().min(1),
  deliverySlotId: z.string().min(1),
  deliveryDate: z.string().min(1),
  paymentMethod: z.literal("CASH_ON_DELIVERY"),
  idempotencyKey: z.string().min(5),
  items: z.array(
    z.object({
      skuId: z.string().min(1),
      quantity: z.number().int().positive(),
      perfectPickSnapshotJson: z.string().optional().nullable(),
      freshnessDate: z.string().optional().nullable(),
    })
  ).min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demoUser) userId = demoUser.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Please log in to complete your order." }, { status: 401 });
    }

    const body = await req.json();
    const data = orderCreateSchema.parse(body);

    // 1. Idempotency Check
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          totalPaise: existingOrder.totalPaise,
          isDuplicate: true,
        },
      });
    }

    // 2. Fetch Address Snapshot
    const address = await prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address) {
      return NextResponse.json({ success: false, error: "Selected delivery address not found." }, { status: 404 });
    }

    // 3. Fetch Delivery Slot
    const slot = await prisma.deliverySlot.findUnique({
      where: { id: data.deliverySlotId },
    });

    if (!slot || !slot.active) {
      return NextResponse.json({ success: false, error: "Selected delivery slot is unavailable." }, { status: 400 });
    }

    // 4. Server-Side Price & SKU Validation (Never trust client prices)
    const skuIds = data.items.map((i) => i.skuId);
    const dbSkus = await prisma.sku.findMany({
      where: { id: { in: skuIds }, active: true },
      include: { product: true },
    });

    if (dbSkus.length !== skuIds.length) {
      return NextResponse.json({ success: false, error: "One or more produce items are no longer active." }, { status: 400 });
    }

    let subtotalPaise = 0;
    const validatedItems = data.items.map((reqItem) => {
      const sku = dbSkus.find((s) => s.id === reqItem.skuId)!;
      const itemTotal = sku.sellingPricePaise * reqItem.quantity;
      subtotalPaise += itemTotal;

      return {
        sku,
        quantity: reqItem.quantity,
        totalGrams: sku.packageSizeGrams * reqItem.quantity,
        unitPricePaise: sku.sellingPricePaise,
        totalPricePaise: itemTotal,
        perfectPickSnapshotJson: reqItem.perfectPickSnapshotJson || null,
        freshnessDate: reqItem.freshnessDate || null,
      };
    });

    // Delivery fee & circular crate deposit calculation
    const FREE_DELIVERY_THRESHOLD = 49900; // ₹499 in paise
    const deliveryFeePaise = subtotalPaise >= FREE_DELIVERY_THRESHOLD ? 0 : 2900; // ₹29
    const packagingDepositPaise = 10000; // ₹100 circular crate deposit
    const totalPaise = subtotalPaise + deliveryFeePaise + packagingDepositPaise;

    const orderNumber = `FH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Execute Order Creation & Batch Stock Reservation in a DB Transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Create Order in CONFIRMED state with CASH_ON_DELIVERY
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: address.id,
          addressSnapshotJson: JSON.stringify(address),
          deliverySlotId: slot.id,
          deliveryDate: new Date(data.deliveryDate),
          status: "CONFIRMED",
          paymentStatus: "UNPAID", // Cash on Delivery collected at doorstep
          subtotalPaise,
          packagingDepositPaise,
          deliveryFeePaise,
          totalPaise,
          idempotencyKey: data.idempotencyKey,
        },
      });

      // Reserve batches & create OrderItems
      for (const valItem of validatedItems) {
        const reservation = await reserveBatchStock(tx, {
          skuId: valItem.sku.id,
          quantityGrams: valItem.totalGrams,
          orderId: order.id,
        });

        if (!reservation.success) {
          throw new Error(reservation.error || `Insufficient stock for ${valItem.sku.product.title}`);
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            skuId: valItem.sku.id,
            allocatedBatchId: reservation.allocatedBatchId,
            productNameSnapshot: valItem.sku.product.title,
            skuCodeSnapshot: valItem.sku.skuCode,
            unitTypeSnapshot: valItem.sku.unitType,
            packageSizeSnapshotGrams: valItem.sku.packageSizeGrams,
            unitPricePaise: valItem.unitPricePaise,
            quantity: valItem.quantity,
            totalPricePaise: valItem.totalPricePaise,
            perfectPickSnapshotJson: valItem.perfectPickSnapshotJson,
            freshnessMatchDateSnapshot: valItem.freshnessDate,
          },
        });
      }

      // Record Cash on Delivery Payment Intent
      await tx.payment.create({
        data: {
          orderId: order.id,
          gateway: "CASH_ON_DELIVERY",
          amountPaise: totalPaise,
          currency: "INR",
          status: "INITIATED",
          idempotencyKey: data.idempotencyKey,
        },
      });

      // Create Circular Crate Deposit Ledger record
      const defaultCrate = await tx.packagingAsset.findFirst({
        where: { status: "IN_WAREHOUSE" },
      });

      if (defaultCrate) {
        await tx.packagingDepositLedger.create({
          data: {
            userId,
            orderId: order.id,
            packagingAssetId: defaultCrate.id,
            depositAmountPaise: packagingDepositPaise,
            status: "CHARGED",
          },
        });
      }

      // Create Picking Task for Darkstore operations
      await tx.pickingTask.create({
        data: {
          orderId: order.id,
          status: "PENDING",
        },
      });

      // Status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: "NONE",
          toStatus: "CONFIRMED",
          reason: "Cash on Delivery order placed and stock reserved.",
          changedBy: "SYSTEM",
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        totalPaise: createdOrder.totalPaise,
        paymentMethod: "CASH_ON_DELIVERY",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to place order." },
      { status: 400 }
    );
  }
}


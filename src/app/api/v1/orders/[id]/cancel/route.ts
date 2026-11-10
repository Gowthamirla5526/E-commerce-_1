import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";

const cancelSchema = z.object({
  reason: z.string().min(3).default("Cancelled by customer request"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason } = cancelSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `Order cannot be cancelled in '${order.status}' status.` },
        { status: 400 }
      );
    }

    // Execute cancellation and inventory restoration within transaction
    await prisma.$transaction(async (tx) => {
      // 1. Release reserved stock back to active batches
      for (const item of order.items) {
        if (item.allocatedBatchId) {
          const totalGrams = item.packageSizeSnapshotGrams * item.quantity;

          await tx.inventoryBatch.update({
            where: { id: item.allocatedBatchId },
            data: {
              availableQuantityGrams: { increment: totalGrams },
              reservedQuantityGrams: { decrement: totalGrams },
            },
          });

          await tx.stockLedgerEntry.create({
            data: {
              batchId: item.allocatedBatchId,
              skuId: item.skuId,
              entryType: "RESERVATION_RELEASE",
              quantityDeltaGrams: totalGrams,
              balanceAfterGrams: 0,
              referenceType: "ORDER_CANCEL",
              referenceId: order.id,
              notes: `Order ${order.orderNumber} cancelled. Stock restored: ${reason}`,
            },
          });
        }
      }

      // 2. Update Order
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancellationReason: reason,
        },
      });

      // 3. Update Picking Task if exists
      await tx.pickingTask.updateMany({
        where: { orderId: id },
        data: { status: "FLAGGED", pickerNotes: `Cancelled: ${reason}` },
      });

      // 4. Log status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: "CANCELLED",
          reason,
          changedBy: "CUSTOMER",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order successfully cancelled and produce stock restored.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel order." },
      { status: 400 }
    );
  }
}


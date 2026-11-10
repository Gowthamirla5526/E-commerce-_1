import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const packingCompleteSchema = z.object({
  orderId: z.string().min(1),
  packagingAssetCode: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, packagingAssetCode } = packingCompleteSchema.parse(body);

    const asset = await prisma.packagingAsset.findUnique({
      where: { assetCode: packagingAssetCode },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: `Packaging crate ${packagingAssetCode} not found in asset registry.` },
        { status: 404 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update packaging asset to DISPATCHED_TO_CUSTOMER
      await tx.packagingAsset.update({
        where: { id: asset.id },
        data: {
          status: "DISPATCHED_TO_CUSTOMER",
          totalCycleCount: { increment: 1 },
        },
      });

      // 2. Update PackingTask
      await tx.packingTask.upsert({
        where: { orderId },
        update: {
          status: "COMPLETED",
          packagingAssetCodes: JSON.stringify([packagingAssetCode]),
          completedAt: new Date(),
          assignedStaffId: session.userId,
        },
        create: {
          orderId,
          status: "COMPLETED",
          packagingAssetCodes: JSON.stringify([packagingAssetCode]),
          completedAt: new Date(),
          assignedStaffId: session.userId,
        },
      });

      // 3. Advance order to PACKED
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PACKED",
        },
      });

      // 4. Record order history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "PACKED",
          reason: `Packed inside reusable ventilated crate ${packagingAssetCode}.`,
          changedBy: session.name,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order packed in crate ${packagingAssetCode} and staged for delivery.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete packing." },
      { status: 400 }
    );
  }
}


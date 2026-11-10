import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const [pickingTasks, ordersReadyForPacking, packagingAssets] = await Promise.all([
    prisma.pickingTask.findMany({
      include: {
        order: {
          include: {
            items: {
              include: {
                sku: { include: { product: true } },
                allocatedBatch: true,
              },
            },
            deliverySlot: true,
          },
        },
      },
      orderBy: { order: { createdAt: "asc" } },
    }),
    prisma.order.findMany({
      where: {
        status: "PICKING",
      },
      include: {
        items: true,
        deliverySlot: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.packagingAsset.findMany({
      where: { status: "IN_WAREHOUSE" },
      include: { packagingType: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      pickingTasks,
      ordersReadyForPacking,
      availablePackagingAssets: packagingAssets,
    },
  });
}


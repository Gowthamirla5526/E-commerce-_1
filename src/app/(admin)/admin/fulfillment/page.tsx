import React from "react";
import { prisma } from "@/core/db/prisma";
import { FulfillmentAdminClient } from "@/app/(admin)/admin/fulfillment/FulfillmentAdminClient";

export const revalidate = 0; // Live admin fulfillment queue

export default async function AdminFulfillmentPage() {
  const [pickingTasks, ordersReadyForPacking, packagingAssets] = await Promise.all([
    prisma.pickingTask.findMany({
      where: { status: "PENDING" },
      include: {
        order: {
          include: {
            items: {
              include: {
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
        status: "PACKING",
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

  const serializedPicking = pickingTasks.map((t) => ({
    id: t.id,
    orderId: t.orderId,
    status: t.status,
    order: {
      orderNumber: t.order.orderNumber,
      createdAt: t.order.createdAt.toISOString(),
      deliverySlot: {
        name: t.order.deliverySlot.name,
        startTime: t.order.deliverySlot.startTime,
      },
      items: t.order.items.map((i) => ({
        id: i.id,
        productNameSnapshot: i.productNameSnapshot,
        packageSizeSnapshotGrams: i.packageSizeSnapshotGrams,
        quantity: i.quantity,
        allocatedBatch: i.allocatedBatch
          ? {
              batchNumber: i.allocatedBatch.batchNumber,
              readinessStage: i.allocatedBatch.readinessStage,
            }
          : null,
        perfectPickSnapshotJson: i.perfectPickSnapshotJson,
      })),
    },
  }));

  const serializedPacking = ordersReadyForPacking.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    deliverySlot: {
      name: o.deliverySlot.name,
    },
    items: o.items.map((i) => ({
      productNameSnapshot: i.productNameSnapshot,
      quantity: i.quantity,
    })),
  }));

  const serializedAssets = packagingAssets.map((a) => ({
    id: a.id,
    assetCode: a.assetCode,
    packagingType: {
      name: a.packagingType.name,
    },
  }));

  return (
    <FulfillmentAdminClient
      pickingTasks={serializedPicking}
      packingOrders={serializedPacking}
      availableAssets={serializedAssets}
    />
  );
}


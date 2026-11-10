import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/core/db/prisma";
import { OrderTrackingClient } from "@/shared/components/orders/OrderTrackingClient";

export const revalidate = 0; // Live order tracking

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      deliverySlot: true,
      items: {
        include: {
          allocatedBatch: true,
        },
      },
      packingTask: true,
    },
  });

  if (!order) {
    notFound();
  }

  let addressSnapshot: any = {};
  try {
    addressSnapshot = JSON.parse(order.addressSnapshotJson);
  } catch (e) {
    addressSnapshot = {
      recipientName: "Customer",
      phone: "+91",
      streetLine1: "",
      locality: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
    };
  }

  let packagingAssetCodes: string[] = [];
  if (order.packingTask?.packagingAssetCodes) {
    try {
      packagingAssetCodes = JSON.parse(order.packingTask.packagingAssetCodes);
    } catch (e) {
      packagingAssetCodes = [];
    }
  }

  const serialized = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalPaise: order.subtotalPaise,
    packagingDepositPaise: order.packagingDepositPaise,
    deliveryFeePaise: order.deliveryFeePaise,
    totalPaise: order.totalPaise,
    deliveryDate: order.deliveryDate.toISOString(),
    cancellationReason: order.cancellationReason,
    createdAt: order.createdAt.toISOString(),
    addressSnapshot: {
      recipientName: addressSnapshot.recipientName || "Customer",
      phone: addressSnapshot.phone || "",
      streetLine1: addressSnapshot.streetLine1 || "",
      locality: addressSnapshot.locality || "",
      city: addressSnapshot.city || "Bengaluru",
      state: addressSnapshot.state || "Karnataka",
      pincode: addressSnapshot.pincode || "560038",
    },
    deliverySlot: {
      name: order.deliverySlot.name,
      startTime: order.deliverySlot.startTime,
      endTime: order.deliverySlot.endTime,
    },
    items: order.items.map((i) => ({
      id: i.id,
      skuId: i.skuId,
      productNameSnapshot: i.productNameSnapshot,
      packageSizeSnapshotGrams: i.packageSizeSnapshotGrams,
      unitPricePaise: i.unitPricePaise,
      quantity: i.quantity,
      totalPricePaise: i.totalPricePaise,
      allocatedBatchNumber: i.allocatedBatch?.batchNumber || null,
      readinessStage: i.allocatedBatch?.readinessStage || null,
    })),
    packingTask: order.packingTask
      ? {
          packagingAssetCodes,
        }
      : null,
  };

  return <OrderTrackingClient order={serialized} />;
}


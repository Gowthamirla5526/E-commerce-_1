import React from "react";
import { prisma } from "@/core/db/prisma";
import { OrdersAdminClient } from "./OrdersAdminClient";

export const revalidate = 0; // Live admin orders

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, phone: true } },
      deliverySlot: { select: { name: true } },
      items: {
        select: {
          productNameSnapshot: true,
          quantity: true,
          unitPricePaise: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user?.name || "Customer",
    customerPhone: o.user?.phone || "",
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalPaise: o.totalPaise,
    itemCount: o.items.length,
    slotName: o.deliverySlot?.name || "Standard",
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      productName: i.productNameSnapshot,
      quantity: i.quantity,
      unitPricePaise: i.unitPricePaise,
    })),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <OrdersAdminClient initialOrders={serialized} />
    </div>
  );
}


import React from "react";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { AccountDashboardClient } from "./AccountDashboardClient";

export const revalidate = 0;

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();
  const dbUser = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      })
    : await prisma.user.findFirst({
        where: { role: "CUSTOMER" },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      });

  const activeUser = dbUser || {
    id: "demo-customer",
    name: "Ananya Sharma",
    email: "customer.ananya@example.com",
    phone: "+91 98765 43220",
    role: "CUSTOMER",
    addresses: [
      {
        id: "addr-1",
        label: "Home",
        recipientName: "Ananya Sharma",
        phone: "+91 98765 43220",
        streetLine1: "Flat 402, Green Glen Gardens",
        streetLine2: "12th Main, HAL 2nd Stage",
        locality: "Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "demo-customer",
      },
    ],
    _count: { orders: 2, addresses: 1 },
  };

  // Fetch recent orders for active tracker
  const recentOrdersRaw = await prisma.order.findMany({
    where: { userId: activeUser.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      items: true,
    },
  });

  const recentOrders = recentOrdersRaw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalPaise: o.totalPaise,
    fulfilmentStatus: o.status || "CONFIRMED",
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.productNameSnapshot || "Fresh Produce Item",
      quantity: i.quantity,
      unitPricePaise: i.unitPricePaise,
    })),
  }));

  return (
    <AccountDashboardClient
      initialUser={{
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        addresses: activeUser.addresses.map((a: any) => ({
          id: a.id,
          label: a.label,
          recipientName: a.recipientName,
          phone: a.phone,
          streetLine1: a.streetLine1,
          streetLine2: a.streetLine2,
          locality: a.locality,
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          isDefault: a.isDefault,
        })),
        _count: activeUser._count,
      }}
      recentOrders={recentOrders}
    />
  );
}

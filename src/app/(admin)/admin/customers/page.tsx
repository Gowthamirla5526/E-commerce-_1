import React from "react";
import { prisma } from "@/core/db/prisma";
import { CustomersAdminClient } from "./CustomersAdminClient";

export const revalidate = 0; // Live admin customers

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          householdProduceItems: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role === "ADMIN" ? "ADMIN" : "USER",
    orderCount: u._count.orders,
    fridgeItemCount: u._count.householdProduceItems,
    joinedAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CustomersAdminClient customers={serialized} />
    </div>
  );
}


import React from "react";
import { prisma } from "@/core/db/prisma";
import { SupplierAdminClient } from "@/app/(admin)/admin/suppliers/SupplierAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: {
        select: { inventoryBatches: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <SupplierAdminClient initialSuppliers={suppliers} />;
}


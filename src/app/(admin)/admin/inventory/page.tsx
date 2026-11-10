import React from "react";
import { prisma } from "@/core/db/prisma";
import { InventoryAdminClient } from "@/app/(admin)/admin/inventory/InventoryAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminInventoryPage() {
  const [batches, skus, suppliers, locations] = await Promise.all([
    prisma.inventoryBatch.findMany({
      include: {
        sku: {
          include: {
            product: true,
          },
        },
        supplier: true,
        location: true,
        inspections: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { receivedDate: "desc" },
    }),
    prisma.sku.findMany({
      where: { active: true },
      include: { product: true },
    }),
    prisma.supplier.findMany({
      where: { active: true },
    }),
    prisma.inventoryLocation.findMany({
      where: { active: true },
    }),
  ]);

  const serializedBatches = batches.map((b) => ({
    id: b.id,
    batchNumber: b.batchNumber,
    initialQuantityGrams: b.initialQuantityGrams,
    availableQuantityGrams: b.availableQuantityGrams,
    readinessStage: b.readinessStage,
    receivedDate: b.receivedDate.toISOString(),
    bestBeforeDate: b.bestBeforeDate.toISOString(),
    status: b.status,
    sku: {
      skuCode: b.sku.skuCode,
      product: {
        title: b.sku.product.title,
      },
    },
    supplier: {
      name: b.supplier.name,
    },
    location: {
      code: b.location.code,
    },
    inspections: b.inspections.map((i) => ({
      overallGrade: i.overallGrade,
      firmnessScore: i.firmnessScore,
      blemishScore: i.blemishScore,
    })),
  }));

  const serializedSkus = skus.map((s) => ({
    id: s.id,
    skuCode: s.skuCode,
    packageSizeGrams: s.packageSizeGrams,
    product: {
      title: s.product.title,
    },
  }));

  const serializedSuppliers = suppliers.map((sup) => ({
    id: sup.id,
    name: sup.name,
    code: sup.code,
  }));

  const serializedLocations = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    code: loc.code,
  }));

  return (
    <InventoryAdminClient
      initialBatches={serializedBatches}
      skus={serializedSkus}
      suppliers={serializedSuppliers}
      locations={serializedLocations}
    />
  );
}


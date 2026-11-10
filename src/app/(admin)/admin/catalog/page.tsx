import React from "react";
import { prisma } from "@/core/db/prisma";
import { CatalogAdminClient } from "@/app/(admin)/admin/catalog/CatalogAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminCatalogPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        skus: {
          where: { active: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return (
    <CatalogAdminClient
      initialProducts={products}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
    />
  );
}


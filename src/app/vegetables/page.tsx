import React from "react";
import { prisma } from "@/core/db/prisma";
import { CategoryListing } from "@/shared/components/catalog/CategoryListing";

export const revalidate = 60;

export default async function VegetablesPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: {
        slug: "daily-vegetables",
      },
    },
    include: {
      category: true,
      skus: {
        where: { active: true },
        include: {
          inventoryBatches: {
            where: { status: "ACTIVE" },
            take: 1,
            orderBy: { receivedDate: "desc" },
          },
        },
      },
    },
  });

  const serialized = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    scientificName: p.scientificName,
    originRegion: p.originRegion,
    featuredImageUrl: p.featuredImageUrl,
    category: {
      name: p.category.name,
      slug: p.category.slug,
    },
    skus: p.skus.map((s) => ({
      id: s.id,
      sellingPricePaise: s.sellingPricePaise,
      mrpPaise: s.mrpPaise,
      packageSizeGrams: s.packageSizeGrams,
      unitType: s.unitType,
    })),
    inventoryBatches: p.skus[0]?.inventoryBatches.map((b) => ({
      batchNumber: b.batchNumber,
      readinessStage: b.readinessStage,
      bestBeforeDate: b.bestBeforeDate.toISOString(),
    })) || [],
  }));

  return (
    <CategoryListing
      title="Daily Native Vegetables"
      description="Crisp cooking staples, heirloom gourds, and root vegetables sourced directly from Kolar and Nilgiri farmer collectives."
      categorySlug="daily-vegetables"
      products={serialized}
    />
  );
}


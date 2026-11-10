import React from "react";
import { prisma } from "@/core/db/prisma";
import { CategoryListing } from "@/shared/components/catalog/CategoryListing";

export const revalidate = 60;

export default async function LeafyPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: {
        slug: "leafy-greens",
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
      title="Morning-Cut Leafy Greens"
      description="Tender palak, fresh methi, native coriander, and regional soppu harvested at dawn and mist-chilled to preserve cellular crispness."
      categorySlug="leafy-greens"
      products={serialized}
    />
  );
}


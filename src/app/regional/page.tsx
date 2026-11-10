import React from "react";
import { prisma } from "@/core/db/prisma";
import { RegionalExplorerClient } from "@/shared/components/regional/RegionalExplorerClient";

export const metadata = {
  title: "Regional Produce Explorer | Fresh Harvest",
  description:
    "Explore indigenous Indian fruit and vegetable cultivars, local-language names, harvest calendars, and authentic cooking traditions.",
};

export default async function RegionalPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      regionalDetail: {
        isNot: null,
      },
    },
    include: {
      category: true,
      regionalDetail: true,
      storageGuide: true,
      skus: {
        where: { active: true },
        take: 1,
      },
    },
  });

  const serialized = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    scientificName: p.scientificName,
    regionalNamesJson: p.regionalNamesJson,
    originRegion: p.originRegion,
    featuredImageUrl: p.featuredImageUrl,
    category: {
      name: p.category.name,
    },
    regionalDetail: {
      nativeState: p.regionalDetail!.nativeState,
      harvestSeasonText: p.regionalDetail!.harvestSeasonText,
      flavorProfile: p.regionalDetail!.flavorProfile,
      textureProfile: p.regionalDetail!.textureProfile,
      culinaryTradition: p.regionalDetail!.culinaryTradition,
      folkUseTips: p.regionalDetail!.folkUseTips,
    },
    storageGuide: p.storageGuide
      ? {
          idealStorageMethod: p.storageGuide.idealStorageMethod,
          optimalTempCelsius: p.storageGuide.optimalTempCelsius,
          prepTip: p.storageGuide.prepTip,
        }
      : null,
    skus: p.skus.map((s) => ({
      id: s.id,
      sellingPricePaise: s.sellingPricePaise,
      mrpPaise: s.mrpPaise,
      packageSizeGrams: s.packageSizeGrams,
      unitType: s.unitType,
    })),
  }));

  return <RegionalExplorerClient initialProducts={serialized} />;
}


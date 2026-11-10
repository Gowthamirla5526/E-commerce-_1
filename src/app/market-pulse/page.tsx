import React from "react";
import { prisma } from "@/core/db/prisma";
import { MarketPulseClient } from "@/shared/components/market/MarketPulseClient";

export const revalidate = 60;

export default async function MarketPulsePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      skus: {
        where: { active: true },
        take: 1,
      },
      marketPriceObservations: {
        include: { source: true },
        orderBy: { observationDate: "desc" },
        take: 1,
      },
      retailPriceHistories: {
        orderBy: { effectiveDate: "desc" },
        take: 1,
      },
    },
    orderBy: { title: "asc" },
  });

  const serialized = products.map((p) => {
    const activeSku = p.skus[0];
    const latestObs = p.marketPriceObservations[0];
    const latestHistory = p.retailPriceHistories[0];

    const packageGrams = activeSku ? activeSku.packageSizeGrams : 1000;
    const skuPricePaise = activeSku ? activeSku.sellingPricePaise : 0;
    const storePricePerKgPaise = Math.round((skuPricePaise / packageGrams) * 1000);
    const mandiBenchmarkPaise = latestObs
      ? latestObs.wholesaleBenchmarkPricePaisePerKg
      : Math.round(storePricePerKgPaise * 0.65);

    const diffPaise = storePricePerKgPaise - mandiBenchmarkPaise;
    const diffPercentage = Math.round((diffPaise / mandiBenchmarkPaise) * 100);

    const gradingRejectionLossPaise = Math.round(mandiBenchmarkPaise * 0.15);
    const coldChainLogisticsPaise = Math.round(mandiBenchmarkPaise * 0.12);
    const sanitizedPackagingPaise = 300;
    const fairDeliveryPartnerPaise = Math.max(
      200,
      diffPaise - (gradingRejectionLossPaise + coldChainLogisticsPaise + sanitizedPackagingPaise)
    );

    return {
      productId: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category.name,
      imageUrl: p.featuredImageUrl,
      packageSizeGrams: packageGrams,
      storeSkuPricePaise: skuPricePaise,
      storePricePerKgPaise,
      mandiBenchmarkPaise,
      diffPaise,
      diffPercentage,
      mandiSource: latestObs?.source?.sourceName || "APMC Yeshwanthpur Wholesale Market Benchmark",
      mandiLocation: latestObs?.source?.location || "Bengaluru",
      lastObservedDate: (latestObs?.observationDate || new Date()).toISOString(),
      reasonForChange:
        latestHistory?.reasonForChange ||
        "Stable seasonal arrivals from regional partner FPO clusters.",
      breakdown: {
        rawMandiPricePaise: mandiBenchmarkPaise,
        gradingRejectionLossPaise,
        coldChainLogisticsPaise,
        sanitizedPackagingPaise,
        fairDeliveryPartnerPaise,
      },
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <MarketPulseClient initialTrends={serialized} />
    </div>
  );
}

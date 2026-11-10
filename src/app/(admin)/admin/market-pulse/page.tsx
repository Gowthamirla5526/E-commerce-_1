import React from "react";
import { prisma } from "@/core/db/prisma";
import { MarketPulseAdminClient } from "./MarketPulseAdminClient";

export const revalidate = 0; // Live admin data

export default async function AdminMarketPulsePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      skus: { where: { active: true }, take: 1 },
      marketPriceObservations: {
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
    const packageGrams = activeSku ? activeSku.packageSizeGrams : 1000;
    const skuPricePaise = activeSku ? activeSku.sellingPricePaise : 0;
    const storePricePerKgPaise = Math.round((skuPricePaise / packageGrams) * 1000);
    const latestObs = p.marketPriceObservations[0];
    const latestMandiBenchmarkPaise = latestObs
      ? latestObs.wholesaleBenchmarkPricePaisePerKg
      : Math.round(storePricePerKgPaise * 0.65);

    return {
      productId: p.id,
      title: p.title,
      category: p.category.name,
      storePricePerKgPaise,
      latestMandiBenchmarkPaise,
      reasonForChange:
        p.retailPriceHistories[0]?.reasonForChange ||
        "Stable seasonal arrivals from regional partner FPO clusters.",
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <MarketPulseAdminClient products={serialized} />
    </div>
  );
}

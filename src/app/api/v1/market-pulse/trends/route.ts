import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";

export async function GET() {
  try {
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

    const trends = products.map((p) => {
      const activeSku = p.skus[0];
      const latestObs = p.marketPriceObservations[0];
      const latestHistory = p.retailPriceHistories[0];

      // Convert unit prices to per-kg basis in Paise
      const packageGrams = activeSku ? activeSku.packageSizeGrams : 1000;
      const skuPricePaise = activeSku ? activeSku.sellingPricePaise : 0;
      const storePricePerKgPaise = Math.round((skuPricePaise / packageGrams) * 1000);
      const mandiBenchmarkPaise = latestObs ? latestObs.wholesaleBenchmarkPricePaisePerKg : Math.round(storePricePerKgPaise * 0.65);

      // Price difference
      const diffPaise = storePricePerKgPaise - mandiBenchmarkPaise;
      const diffPercentage = Math.round((diffPaise / mandiBenchmarkPaise) * 100);

      // Transparent Cost Breakdown (realistic produce supply chain model)
      const gradingRejectionLossPaise = Math.round(mandiBenchmarkPaise * 0.15); // ~15% unmarketable sort loss
      const coldChainLogisticsPaise = Math.round(mandiBenchmarkPaise * 0.12); // Refrigerated transit
      const sanitizedPackagingPaise = 300; // ₹3.00 reusable crate depreciation & bio-wrapping
      const fairDeliveryPartnerPaise = Math.max(200, diffPaise - (gradingRejectionLossPaise + coldChainLogisticsPaise + sanitizedPackagingPaise));

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
        lastObservedDate: latestObs?.observationDate || new Date(),
        reasonForChange: latestHistory?.reasonForChange || "Stable seasonal arrivals from regional partner FPO clusters.",
        breakdown: {
          rawMandiPricePaise: mandiBenchmarkPaise,
          gradingRejectionLossPaise,
          coldChainLogisticsPaise,
          sanitizedPackagingPaise,
          fairDeliveryPartnerPaise,
        },
      };
    });

    return NextResponse.json({ success: true, data: trends });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load market pulse trends." },
      { status: 500 }
    );
  }
}

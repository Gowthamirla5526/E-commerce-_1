import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";

const matchmakerQuerySchema = z.object({
  consumptionDate: z.string().min(1), // e.g. "TODAY", "TOMORROW", "IN_2_3_DAYS", "WEEKEND", or ISO date string
  intendedUse: z.enum(["FRESH_EATING", "JUICING", "COOKING", "STORAGE"]).default("FRESH_EATING"),
  categorySlug: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { consumptionDate, intendedUse, categorySlug } = matchmakerQuerySchema.parse(body);

    // Determine target readiness stages based on consumption timeline & intended use
    let targetStages: string[] = ["READY_TO_EAT", "PEAK"];
    let matchAdvice = "Ready to eat immediately with peak flavor and aroma.";

    if (consumptionDate === "TODAY") {
      targetStages = intendedUse === "COOKING" ? ["READY_TO_EAT", "RAW"] : ["READY_TO_EAT", "PEAK"];
      matchAdvice = "Verified batches for immediate consumption today.";
    } else if (consumptionDate === "TOMORROW") {
      targetStages = ["TURNING", "READY_TO_EAT"];
      matchAdvice = "Turning stage batches that will reach optimum ripeness by tomorrow morning.";
    } else if (consumptionDate === "IN_2_3_DAYS") {
      targetStages = ["RAW", "TURNING"];
      matchAdvice = "Harvested at turning stage; naturally ripens on your countertop over 2-3 days.";
    } else if (consumptionDate === "WEEKEND") {
      targetStages = ["RAW", "TURNING"];
      matchAdvice = "Selected for resilience and slow ripening to peak over the weekend.";
    }

    const whereCondition: any = {
      status: "ACTIVE",
      availableQuantityGrams: { gt: 0 },
      readinessStage: { in: targetStages },
      sku: {
        active: true,
        product: {
          active: true,
        },
      },
    };

    if (categorySlug) {
      whereCondition.sku.product.category = { slug: categorySlug };
    }

    const batches = await prisma.inventoryBatch.findMany({
      where: whereCondition,
      include: {
        sku: {
          include: {
            product: {
              include: {
                category: true,
                storageGuide: true,
                regionalDetail: true,
              },
            },
          },
        },
        supplier: true,
      },
      orderBy: { bestBeforeDate: "asc" },
      take: 12,
    });

    const recommendations = batches.map((b) => ({
      batchId: b.id,
      batchNumber: b.batchNumber,
      readinessStage: b.readinessStage,
      bestBeforeDate: b.bestBeforeDate.toISOString(),
      availableQuantityGrams: b.availableQuantityGrams,
      supplierName: b.supplier.name,
      matchAdvice,
      product: {
        id: b.sku.product.id,
        title: b.sku.product.title,
        slug: b.sku.product.slug,
        scientificName: b.sku.product.scientificName,
        originRegion: b.sku.product.originRegion,
        featuredImageUrl: b.sku.product.featuredImageUrl,
        categoryName: b.sku.product.category.name,
      },
      sku: {
        id: b.sku.id,
        skuCode: b.sku.skuCode,
        packageSizeGrams: b.sku.packageSizeGrams,
        sellingPricePaise: b.sku.sellingPricePaise,
        mrpPaise: b.sku.mrpPaise,
        unitType: b.sku.unitType,
      },
      storageAdvice: b.sku.product.storageGuide?.prepTip || "Store in a cool dry space.",
    }));

    return NextResponse.json({
      success: true,
      data: {
        consumptionDate,
        intendedUse,
        targetStages,
        matchAdvice,
        totalMatches: recommendations.length,
        recommendations,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to match freshness." },
      { status: 400 }
    );
  }
}

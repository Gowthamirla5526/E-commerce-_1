import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const marketPulseUpdateSchema = z.object({
  productId: z.string().min(1),
  wholesaleBenchmarkPricePaisePerKg: z.number().int().positive(),
  sourceName: z.string().default("APMC Yeshwanthpur Wholesale Market Benchmark"),
  reasonForChange: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = marketPulseUpdateSchema.parse(body);

    let source = await prisma.marketPriceSource.findFirst({
      where: { sourceName: data.sourceName },
    });

    if (!source) {
      source = await prisma.marketPriceSource.create({
        data: {
          sourceName: data.sourceName,
          location: "Bengaluru",
          state: "Karnataka",
        },
      });
    }

    const observation = await prisma.marketPriceObservation.create({
      data: {
        sourceId: source.id,
        productId: data.productId,
        wholesaleBenchmarkPricePaisePerKg: data.wholesaleBenchmarkPricePaisePerKg,
        observationDate: new Date(),
        verifiedBy: session.name || "DARKSTORE_PROCUREMENT_LEAD",
      },
    });

    if (data.reasonForChange) {
      const activeSku = await prisma.sku.findFirst({
        where: { productId: data.productId, active: true },
      });

      if (activeSku) {
        await prisma.retailPriceHistory.create({
          data: {
            productId: data.productId,
            skuId: activeSku.id,
            pricePaise: activeSku.sellingPricePaise,
            effectiveDate: new Date(),
            reasonForChange: data.reasonForChange,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Market pulse APMC benchmark recorded successfully.",
      data: observation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update market pulse." },
      { status: 400 }
    );
  }
}

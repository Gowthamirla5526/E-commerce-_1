import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getAdminSession } from "@/core/security/auth";

const productCreateSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  categoryId: z.string().min(1),
  scientificName: z.string().optional().nullable(),
  regionalNamesJson: z.string().default("{}"),
  description: z.string().min(5),
  originRegion: z.string().optional().nullable(),
  featuredImageUrl: z.string().url(),
  isSeasonal: z.boolean().default(false),
  active: z.boolean().default(true),
  sku: z.object({
    skuCode: z.string().min(3),
    packageSizeGrams: z.number().int().positive(),
    mrpPaise: z.number().int().positive(),
    sellingPricePaise: z.number().int().positive(),
    unitType: z.string().default("GRAMS"),
  }),
});

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      skus: {
        include: {
          inventoryBatches: {
            where: { status: "ACTIVE" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = productCreateSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId,
          scientificName: data.scientificName,
          regionalNamesJson: data.regionalNamesJson,
          description: data.description,
          originRegion: data.originRegion,
          featuredImageUrl: data.featuredImageUrl,
          galleryUrlsJson: JSON.stringify([data.featuredImageUrl]),
          isSeasonal: data.isSeasonal,
          active: data.active,
        },
      });

      const sku = await tx.sku.create({
        data: {
          productId: prod.id,
          skuCode: data.sku.skuCode,
          packageSizeGrams: data.sku.packageSizeGrams,
          mrpPaise: data.sku.mrpPaise,
          sellingPricePaise: data.sku.sellingPricePaise,
          unitType: data.sku.unitType,
        },
      });

      // Default storage guide
      await tx.storageGuide.create({
        data: {
          productId: prod.id,
          idealStorageMethod: "REFRIGERATE",
          optimalTempCelsius: "4-8°C",
          expectedShelfLifeDays: 5,
          ethyleneProducer: false,
          ethyleneSensitive: false,
          prepTip: "Keep unwashed in vegetable crisper.",
        },
      });

      return { ...prod, sku };
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product." },
      { status: 400 }
    );
  }
}

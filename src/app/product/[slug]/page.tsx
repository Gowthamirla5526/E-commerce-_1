import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/core/db/prisma";
import { ProductDetailClient } from "@/shared/components/catalog/ProductDetailClient";
import { ProductCard } from "@/shared/components/catalog/ProductCard";
import { ChevronRight, ArrowRight } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return { title: "Produce Not Found | Fresh Harvest" };
  }

  return {
    title: `${product.title} | Fresh Harvest`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      skus: {
        where: { active: true },
        include: {
          inventoryBatches: {
            where: { status: "ACTIVE" },
            include: {
              supplier: true,
              inspections: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
            take: 1,
            orderBy: { receivedDate: "desc" },
          },
        },
      },
      storageGuide: true,
      regionalDetail: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      active: true,
    },
    take: 4,
    include: {
      category: true,
      skus: {
        where: { active: true },
        take: 1,
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

  // Pick default batch
  const defaultSku = product.skus[0];
  const defaultBatch = defaultSku?.inventoryBatches[0];

  const serializedProduct = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    scientificName: product.scientificName,
    regionalNamesJson: product.regionalNamesJson,
    description: product.description,
    originRegion: product.originRegion,
    featuredImageUrl: product.featuredImageUrl,
    galleryUrlsJson: product.galleryUrlsJson,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    skus: product.skus.map((s) => ({
      id: s.id,
      sellingPricePaise: s.sellingPricePaise,
      mrpPaise: s.mrpPaise,
      packageSizeGrams: s.packageSizeGrams,
      unitType: s.unitType,
    })),
    storageGuide: product.storageGuide
      ? {
          idealStorageMethod: product.storageGuide.idealStorageMethod,
          optimalTempCelsius: product.storageGuide.optimalTempCelsius,
          expectedShelfLifeDays: product.storageGuide.expectedShelfLifeDays,
          ethyleneProducer: product.storageGuide.ethyleneProducer,
          ethyleneSensitive: product.storageGuide.ethyleneSensitive,
          prepTip: product.storageGuide.prepTip,
        }
      : null,
    regionalDetail: product.regionalDetail
      ? {
          nativeState: product.regionalDetail.nativeState,
          harvestSeasonText: product.regionalDetail.harvestSeasonText,
          flavorProfile: product.regionalDetail.flavorProfile,
          textureProfile: product.regionalDetail.textureProfile,
          culinaryTradition: product.regionalDetail.culinaryTradition,
          folkUseTips: product.regionalDetail.folkUseTips,
        }
      : null,
    activeBatch: defaultBatch
      ? {
          batchNumber: defaultBatch.batchNumber,
          readinessStage: defaultBatch.readinessStage,
          receivedDate: defaultBatch.receivedDate.toISOString(),
          bestBeforeDate: defaultBatch.bestBeforeDate.toISOString(),
          supplierName: defaultBatch.supplier.name,
          inspection: defaultBatch.inspections[0]
            ? {
                overallGrade: defaultBatch.inspections[0].overallGrade,
                firmnessScore: defaultBatch.inspections[0].firmnessScore,
                blemishScore: defaultBatch.inspections[0].blemishScore,
                notes: defaultBatch.inspections[0].notes,
              }
            : null,
        }
      : null,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link
          href={`/${product.category.slug === "fresh-fruits" ? "fruits" : product.category.slug === "leafy-greens" ? "leafy" : product.category.slug === "seasonal-harvests" ? "seasonal" : "vegetables"}`}
          className="hover:text-[#2d6a4f] transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#1c2421] font-semibold truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Interactive Product Detail */}
      <ProductDetailClient product={serializedProduct} />

      {/* Related Seasonal / Category Produce */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-[#e8e3d9]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1c2421]">
                More from {product.category.name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Freshly batched morning arrivals from the same category
              </p>
            </div>
            <Link
              href={`/${product.category.slug === "fresh-fruits" ? "fruits" : product.category.slug === "leafy-greens" ? "leafy" : product.category.slug === "seasonal-harvests" ? "seasonal" : "vegetables"}`}
              className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => {
              const relSku = rel.skus[0];
              const relBatch = relSku?.inventoryBatches?.[0];
              if (!relSku) return null;

              return (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  title={rel.title}
                  slug={rel.slug}
                  scientificName={rel.scientificName}
                  originRegion={rel.originRegion}
                  featuredImageUrl={rel.featuredImageUrl}
                  categoryName={rel.category.name}
                  sku={{
                    id: relSku.id,
                    sellingPricePaise: relSku.sellingPricePaise,
                    mrpPaise: relSku.mrpPaise,
                    packageSizeGrams: relSku.packageSizeGrams,
                    unitType: relSku.unitType,
                  }}
                  activeBatch={
                    relBatch
                      ? {
                          batchNumber: relBatch.batchNumber,
                          readinessStage: relBatch.readinessStage,
                          bestBeforeDate: relBatch.bestBeforeDate.toISOString(),
                        }
                      : null
                  }
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}


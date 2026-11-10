import React from "react";
import Link from "next/link";
import { prisma } from "@/core/db/prisma";
import { ProductCard } from "@/shared/components/catalog/ProductCard";
import { Heart, ChevronRight, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function WishlistPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    take: 6,
    include: {
      category: true,
      skus: {
        where: { active: true },
        take: 1,
        include: {
          inventoryBatches: {
            where: { status: "ACTIVE" },
            take: 1,
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">Saved Staples & Wishlist</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1c2421] tracking-tight">
              My Saved Produce Staples
            </h1>
            <p className="text-xs text-stone-500">
              Quickly re-add your family&apos;s favourite cooking essentials to your morning basket.
            </p>
          </div>
        </div>

        <Link
          href="/vegetables"
          className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => {
          const sku = p.skus[0];
          const batch = sku?.inventoryBatches?.[0];
          if (!sku) return null;

          return (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              scientificName={p.scientificName}
              originRegion={p.originRegion}
              featuredImageUrl={p.featuredImageUrl}
              categoryName={p.category.name}
              sku={{
                id: sku.id,
                sellingPricePaise: sku.sellingPricePaise,
                mrpPaise: sku.mrpPaise,
                packageSizeGrams: sku.packageSizeGrams,
                unitType: sku.unitType,
              }}
              activeBatch={
                batch
                  ? {
                      batchNumber: batch.batchNumber,
                      readinessStage: batch.readinessStage,
                      bestBeforeDate: batch.bestBeforeDate.toISOString(),
                    }
                  : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}


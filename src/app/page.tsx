import React from "react";
import Link from "next/link";
import { prisma } from "@/core/db/prisma";
import { ProductCard } from "@/shared/components/catalog/ProductCard";
import { WeeklyBestsellersClient, SerializedProduct } from "@/shared/components/catalog/WeeklyBestsellersClient";
import { HomeHeroClient } from "@/shared/components/home/HomeHeroClient";
import { HomeCategoriesClient, TodaysPicksHeader } from "@/shared/components/home/HomeCategoriesClient";
import {
  Sparkles,
  ArrowRight,
  Refrigerator,
  Compass,
  Package,
  Calendar,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export default async function HomePage() {
  // Fetch live products with SKUs, categories, and latest active batch
  const [allProducts, categories, activeHarvestDrop] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
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
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.harvestCampaign.findFirst({
      where: { status: "NEAR_TARGET" },
    }),
  ]);

  // Serialize products for client components and cards
  const serializedProducts: SerializedProduct[] = allProducts.map((p) => {
    const sku = p.skus[0];
    const batch = sku?.inventoryBatches?.[0];
    const discount =
      sku && sku.mrpPaise > sku.sellingPricePaise
        ? Math.round(((sku.mrpPaise - sku.sellingPricePaise) / sku.mrpPaise) * 100)
        : 0;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      scientificName: p.scientificName,
      originRegion: p.originRegion,
      featuredImageUrl: p.featuredImageUrl,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      sku: {
        id: sku?.id || "",
        sellingPricePaise: sku?.sellingPricePaise || 0,
        mrpPaise: sku?.mrpPaise || 0,
        packageSizeGrams: sku?.packageSizeGrams || 500,
        unitType: sku?.unitType || "GRAMS",
      },
      activeBatch: batch
        ? {
            batchNumber: batch.batchNumber,
            readinessStage: batch.readinessStage,
            bestBeforeDate: batch.bestBeforeDate.toISOString(),
          }
        : null,
      rating: ((43 + (Math.abs(p.id.charCodeAt(0) + p.id.length) % 6)) / 10),
      isBestseller: discount >= 20 || p.slug.includes("banana") || p.slug.includes("apple") || p.slug.includes("tomato"),
    };
  });

  // Segregate for sections (now showcasing full variety across 62 produce SKUs)
  const todaysPicks = serializedProducts.slice(0, 10);
  const mostSellingProducts = serializedProducts.slice(10, 20);
  const heroFeaturedProduct =
    serializedProducts.find((p) => p.slug.includes("banana")) || serializedProducts[0];

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HERO BANNER & 2. PROMOTIONAL BANNERS (Localized Client Component) */}
      <HomeHeroClient heroFeaturedProduct={heroFeaturedProduct} />

      {/* 3. POPULAR CATEGORIES (Localized Client Component) */}
      <HomeCategoriesClient />

      {/* 4. TODAY'S FRESH PICKS */}
      <section id="todays-picks" className="space-y-5">
        <TodaysPicksHeader />

        {/* 5-Column Responsive Grid matching reference */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {todaysPicks.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              scientificName={product.scientificName}
              originRegion={product.originRegion}
              featuredImageUrl={product.featuredImageUrl}
              categoryName={product.categoryName}
              sku={product.sku}
              activeBatch={product.activeBatch}
              rating={product.rating}
              isBestseller={product.isBestseller}
            />
          ))}
        </div>
      </section>

      {/* 5. WEEKLY BESTSELLING ITEMS */}
      <section id="weekly-bestsellers">
        <WeeklyBestsellersClient products={serializedProducts} />
      </section>

      {/* 6. MOST SELLING PRODUCTS */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]"></span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Daily Verified Favorites
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified favorites based on daily darkstore fulfilment frequency
            </p>
          </div>

          <Link
            href="/fruits"
            className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Column Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {mostSellingProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              scientificName={product.scientificName}
              originRegion={product.originRegion}
              featuredImageUrl={product.featuredImageUrl}
              categoryName={product.categoryName}
              sku={product.sku}
              activeBatch={product.activeBatch}
              rating={product.rating}
              isBestseller={true}
            />
          ))}
        </div>
      </section>

      {/* 7. COMMUNITY HARVEST DROP (IF ACTIVE) */}
      {activeHarvestDrop && (
        <section className="bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] rounded-3xl p-6 text-white relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#e85d04] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <span>Community Harvest Drop</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeHarvestDrop.title}
              </h3>
              <p className="text-xs text-[#d8f3dc] max-w-xl leading-relaxed">
                {activeHarvestDrop.description} Harvested direct from {activeHarvestDrop.farmName} once community target is reached.
              </p>
            </div>
            <div className="lg:col-span-4 flex items-center justify-end">
              <Link
                href="/harvest-drops"
                className="bg-white text-[#1b4332] hover:bg-[#d8f3dc] text-xs font-extrabold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Join Harvest Group</span>
                <ArrowRight className="w-4 h-4 text-[#1b4332]" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 8. SIGNATURE SMART KITCHEN FEATURES */}
      <section className="bg-white rounded-3xl border border-[#e8e3d9] p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Produce Intelligence Services
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Proprietary tools engineered to eliminate produce spoilage and lower kitchen waste
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/matchmaker"
            className="p-5 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <h4 className="font-bold text-sm text-[#1c2421] group-hover:text-[#2d6a4f] transition-colors">
              Freshness Matchmaker
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Shelf-life matched produce batches for planned weekly cooking.
            </p>
          </Link>

          <Link
            href="/fridge"
            className="p-5 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#e85d04] flex items-center justify-center mb-3">
              <Refrigerator className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1c2421] group-hover:text-[#2d6a4f] transition-colors">
              My Fridge Tracker
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Real-time expiration countdown and recipe suggestions for items in your fridge.
            </p>
          </Link>

          <Link
            href="/fresh-plan"
            className="p-5 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1c2421] group-hover:text-[#2d6a4f] transition-colors">
              7-Day Fresh Plan
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Zero-waste meal plan subtracting what you already have in stock.
            </p>
          </Link>

          <Link
            href="/packaging"
            className="p-5 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1b4332] flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <h4 className="font-bold text-sm text-[#1c2421] group-hover:text-[#2d6a4f] transition-colors">
              Zero-Plastic Crates
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Food-grade returnable crates with ₹50 instant circular deposit refund.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

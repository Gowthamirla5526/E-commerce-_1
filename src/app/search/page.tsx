import React from "react";
import Link from "next/link";
import { prisma } from "@/core/db/prisma";
import { ProductCard } from "@/shared/components/catalog/ProductCard";
import { Search, ChevronRight, Sparkles } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  let products: Array<any> = [];

  if (query) {
    products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { scientificName: { contains: query } },
          { regionalNamesJson: { contains: query } },
          { originRegion: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
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
  }

  // Pre-configured popular searches
  const popularKeywords = [
    "Tomato",
    "Yelakki Banana",
    "Carrot",
    "Palak",
    "Tindora",
    "Alphonso",
    "Kolar",
    "Ooty",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#1c2421] font-semibold">Search Catalog</span>
      </nav>

      {/* Search Header Form */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f]"></span>
          <h1 className="text-2xl font-extrabold text-[#1c2421] tracking-tight">
            Search Fresh Produce
          </h1>
        </div>
        <p className="text-xs text-stone-500">
          Search by English, Kannada, Tamil, Hindi names, regional origin, or botanical variety.
        </p>

        <form action="/search" method="GET" className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search e.g. 'Kolar tomato', 'ತೊಗರಿ ಟೊಮೆಟೊ', 'Yelakki', 'Nilgiri carrot'..."
            className="w-full bg-[#fbf9f5] border border-[#d8d2c7] rounded-xl pl-12 pr-28 py-3 text-sm focus:outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-stone-500 font-medium">Quick Suggestions:</span>
          {popularKeywords.map((kw) => (
            <Link
              key={kw}
              href={`/search?q=${encodeURIComponent(kw)}`}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f4f1ea] text-stone-700 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition-colors"
            >
              {kw}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {query ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Found <strong className="text-stone-900">{products.length}</strong> fresh produce results for &ldquo;{query}&rdquo;
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8e3d9] p-12 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-bold text-base text-[#1c2421]">No produce found matching &ldquo;{query}&rdquo;</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We only stock fresh, verified fruits and vegetables. Try searching for staples like tomatoes, bananas, palak, or carrots.
              </p>
              <Link
                href="/vegetables"
                className="inline-block mt-2 bg-[#2d6a4f] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1b4332] transition-colors"
              >
                Browse All Vegetables
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => {
                const defaultSku = p.skus[0];
                const defaultBatch = defaultSku?.inventoryBatches?.[0];

                if (!defaultSku) return null;

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
                      id: defaultSku.id,
                      sellingPricePaise: defaultSku.sellingPricePaise,
                      mrpPaise: defaultSku.mrpPaise,
                      packageSizeGrams: defaultSku.packageSizeGrams,
                      unitType: defaultSku.unitType,
                    }}
                    activeBatch={
                      defaultBatch
                        ? {
                            batchNumber: defaultBatch.batchNumber,
                            readinessStage: defaultBatch.readinessStage,
                            bestBeforeDate: defaultBatch.bestBeforeDate.toISOString(),
                          }
                        : null
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#1c2421]">Type above to search produce batches</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Direct real-time lookups across current darkstore inventory and regional varieties.
          </p>
        </div>
      )}
    </div>
  );
}


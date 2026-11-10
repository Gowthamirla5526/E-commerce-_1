"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/shared/components/catalog/ProductCard";
import { Filter, SlidersHorizontal, ChevronRight, ShieldCheck } from "lucide-react";

export interface SerializedProduct {
  id: string;
  title: string;
  slug: string;
  scientificName: string | null;
  originRegion: string | null;
  featuredImageUrl: string;
  category: {
    name: string;
    slug: string;
  };
  skus: Array<{
    id: string;
    sellingPricePaise: number;
    mrpPaise: number;
    packageSizeGrams: number;
    unitType: string;
  }>;
  inventoryBatches: Array<{
    batchNumber: string;
    readinessStage: string;
    bestBeforeDate: string;
  }>;
}

export interface CategoryListingProps {
  title: string;
  description: string;
  categorySlug?: string;
  products: SerializedProduct[];
}

export const CategoryListing: React.FC<CategoryListingProps> = ({
  title,
  description,
  categorySlug,
  products,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState<string>("ALL");
  const [selectedRipeness, setSelectedRipeness] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("DEFAULT");

  // Extract unique origins from products
  const origins = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.originRegion) {
        const primary = p.originRegion.split(",")[0].trim();
        set.add(primary);
      }
    });
    return Array.from(set);
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedOrigin !== "ALL") {
        if (!p.originRegion || !p.originRegion.includes(selectedOrigin)) {
          return false;
        }
      }
      if (selectedRipeness !== "ALL") {
        const batch = p.inventoryBatches[0];
        if (!batch || batch.readinessStage !== selectedRipeness) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === "PRICE_ASC") {
      result = [...result].sort(
        (a, b) => (a.skus[0]?.sellingPricePaise || 0) - (b.skus[0]?.sellingPricePaise || 0)
      );
    } else if (sortBy === "PRICE_DESC") {
      result = [...result].sort(
        (a, b) => (b.skus[0]?.sellingPricePaise || 0) - (a.skus[0]?.sellingPricePaise || 0)
      );
    }

    return result;
  }, [products, selectedOrigin, selectedRipeness, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#1c2421] font-semibold">{title}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f]"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c2421] tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#d8f3dc] px-3.5 py-1.5 rounded-xl border border-[#b7e4c7] text-xs font-semibold text-[#1b4332] shrink-0 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#2d6a4f]" />
          <span>Indiranagar Darkstore • Morning Inwarded</span>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="bg-white rounded-xl border border-[#e8e3d9] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Origin Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-stone-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Origin:
          </span>
          <button
            onClick={() => setSelectedOrigin("ALL")}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              selectedOrigin === "ALL"
                ? "bg-[#2d6a4f] text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            All Regions
          </button>
          {origins.map((orig) => (
            <button
              key={orig}
              onClick={() => setSelectedOrigin(orig)}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedOrigin === orig
                  ? "bg-[#2d6a4f] text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {orig}
            </button>
          ))}
        </div>

        {/* Ripeness & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Ripeness:</span>
            <select
              value={selectedRipeness}
              onChange={(e) => setSelectedRipeness(e.target.value)}
              className="bg-[#fbf9f5] border border-[#e0dacf] rounded-lg px-2.5 py-1 text-xs text-stone-800 font-medium focus:outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">All Stages</option>
              <option value="READY_TO_EAT">Ready to Eat Today</option>
              <option value="TURNING">Turning (2-3 Days)</option>
              <option value="PEAK">Peak Morning Fresh</option>
              <option value="RAW">Raw for Cooking</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#fbf9f5] border border-[#e0dacf] rounded-lg px-2.5 py-1 text-xs text-stone-800 font-medium focus:outline-none focus:border-[#2d6a4f]"
            >
              <option value="DEFAULT">Recommended</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-12 text-center space-y-3">
          <div className="text-4xl">🥬</div>
          <h3 className="font-bold text-base text-[#1c2421]">No produce matching selected filters</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting the region or ripeness filter to see all active verified batches.
          </p>
          <button
            onClick={() => {
              setSelectedOrigin("ALL");
              setSelectedRipeness("ALL");
            }}
            className="text-xs font-semibold text-[#2d6a4f] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => {
            const defaultSku = p.skus[0];
            const defaultBatch = p.inventoryBatches[0];

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
                activeBatch={defaultBatch || null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};


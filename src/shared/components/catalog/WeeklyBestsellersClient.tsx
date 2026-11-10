"use client";

import React, { useState, useMemo } from "react";
import { ProductCard } from "@/shared/components/catalog/ProductCard";
import { useLanguage } from "@/core/i18n/LanguageContext";

export interface SerializedProduct {
  id: string;
  title: string;
  slug: string;
  scientificName?: string | null;
  originRegion?: string | null;
  featuredImageUrl: string;
  categoryName: string;
  categorySlug: string;
  sku: {
    id: string;
    sellingPricePaise: number;
    mrpPaise: number;
    packageSizeGrams: number;
    unitType: string;
  };
  activeBatch?: {
    batchNumber: string;
    readinessStage: string;
    bestBeforeDate: string;
  } | null;
  rating?: number;
  isBestseller?: boolean;
}

interface WeeklyBestsellersClientProps {
  products: SerializedProduct[];
}

export const WeeklyBestsellersClient: React.FC<WeeklyBestsellersClientProps> = ({
  products,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = [
    { label: t("all"), filter: "all" },
    { label: t("vegetables"), filter: "vegetables" },
    { label: t("fruits"), filter: "fruits" },
    { label: t("leafy"), filter: "leafy" },
    { label: t("deals"), filter: "deals" },
  ];

  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case "vegetables":
        return products.filter((p) =>
          p.categorySlug.includes("veg") || p.categoryName.toLowerCase().includes("veg")
        );
      case "fruits":
        return products.filter((p) =>
          p.categorySlug.includes("fruit") || p.categoryName.toLowerCase().includes("fruit")
        );
      case "leafy":
        return products.filter((p) =>
          p.categorySlug.includes("leafy") ||
          p.categoryName.toLowerCase().includes("leafy") ||
          p.categoryName.toLowerCase().includes("herb")
        );
      case "deals":
        return products.filter((p) => {
          const discount =
            p.sku.mrpPaise > p.sku.sellingPricePaise
              ? (p.sku.mrpPaise - p.sku.sellingPricePaise) / p.sku.mrpPaise
              : 0;
          return discount >= 0.15;
        });
      default:
        return products;
    }
  }, [products, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header with Horizontal Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f]"></span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {t("weeklyBestsellers")}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {t("weeklyBestsellersSub")}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.filter;
            return (
              <button
                key={tab.filter}
                onClick={() => setActiveTab(tab.filter)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2d6a4f] text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid: 5 columns on desktop, 2 columns on mobile */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
          <p className="text-sm font-semibold text-stone-500">
            No produce items match the selected category right now.
          </p>
          <button
            onClick={() => setActiveTab("all")}
            className="mt-3 text-xs font-bold text-[#2d6a4f] hover:underline cursor-pointer"
          >
            Show All →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredProducts.slice(0, 10).map((product) => (
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
      )}
    </div>
  );
};

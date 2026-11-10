"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass, Sparkles, MapPin, ChevronRight, Plus, Minus, ArrowRight } from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";
import { useCart } from "@/shared/context/CartContext";

interface RegionalProduct {
  id: string;
  title: string;
  slug: string;
  scientificName: string | null;
  regionalNamesJson: string;
  originRegion: string | null;
  featuredImageUrl: string;
  category: {
    name: string;
  };
  regionalDetail: {
    nativeState: string;
    harvestSeasonText: string;
    flavorProfile: string;
    textureProfile: string;
    culinaryTradition: string;
    folkUseTips: string;
  };
  storageGuide?: {
    idealStorageMethod: string;
    optimalTempCelsius: string;
    prepTip: string;
  } | null;
  skus: Array<{
    id: string;
    sellingPricePaise: number;
    mrpPaise: number;
    packageSizeGrams: number;
    unitType: string;
  }>;
}

export const RegionalExplorerClient: React.FC<{ initialProducts: RegionalProduct[] }> = ({
  initialProducts,
}) => {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedState, setSelectedState] = useState<string>("ALL");

  const states = ["ALL", "Karnataka", "Tamil Nadu", "Maharashtra"];

  const filtered = initialProducts.filter((p) => {
    if (selectedState === "ALL") return true;
    return p.regionalDetail.nativeState === selectedState;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">Regional Produce Explorer</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8f3dc] text-[#1b4332] text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-[#2d6a4f]" />
          <span>Signature Feature 05</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Regional Produce Explorer
        </h1>
        <p className="text-xs sm:text-sm text-[#d8f3dc]/90 max-w-2xl leading-relaxed">
          Discover native Indian fruit and vegetable cultivars. Explore regional harvest calendars, authentic local-language varieties, culinary traditions, and heritage cooking secrets.
        </p>
      </div>

      {/* State Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-600 mr-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" /> Select Terroir:
        </span>
        {states.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedState === st
                ? "bg-[#2d6a4f] text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-700 hover:border-stone-300"
            }`}
          >
            {st === "ALL" ? "All Indigenous Varieties" : `${st} Cultivars`}
          </button>
        ))}
      </div>

      {/* Produce Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((prod) => {
          const sku = prod.skus[0];
          const cartItem = items.find((i) => i.skuId === sku?.id);
          const quantity = cartItem ? cartItem.quantity : 0;

          let regionalNames: Record<string, string> = {};
          try {
            regionalNames = JSON.parse(prod.regionalNamesJson);
          } catch (e) {
            regionalNames = {};
          }

          return (
            <div
              key={prod.id}
              className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs flex flex-col justify-between space-y-5 produce-card"
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={prod.featuredImageUrl}
                      alt={prod.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#2d6a4f] bg-[#d8f3dc] px-2 py-0.5 rounded-full">
                        📍 {prod.regionalDetail.nativeState}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {prod.regionalDetail.harvestSeasonText}
                      </span>
                    </div>

                    <Link
                      href={`/product/${prod.slug}`}
                      className="font-bold text-base text-[#1c2421] hover:text-[#2d6a4f] transition-colors block truncate"
                    >
                      {prod.title}
                    </Link>

                    {prod.scientificName && (
                      <p className="text-[11px] italic text-stone-500 font-serif">
                        {prod.scientificName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Multilingual Tags */}
                {Object.keys(regionalNames).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {Object.entries(regionalNames).map(([lang, val]) => (
                      <span key={lang} className="bg-[#f4f1ea] px-2 py-0.5 rounded-md text-stone-700">
                        <strong className="capitalize text-stone-500 font-normal">{lang}:</strong> {val}
                      </span>
                    ))}
                  </div>
                )}

                {/* Flavor & Culinary Heritage */}
                <div className="space-y-2 text-xs text-stone-600 bg-[#fbf9f5] rounded-2xl p-4 border border-[#ede9df]">
                  <div>
                    <strong className="text-stone-900 block">Flavor & Mouthfeel:</strong>
                    <p className="mt-0.5">{prod.regionalDetail.flavorProfile} ({prod.regionalDetail.textureProfile}).</p>
                  </div>
                  <div>
                    <strong className="text-stone-900 block">Traditional Culinary Heritage:</strong>
                    <p className="mt-0.5">{prod.regionalDetail.culinaryTradition}</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-900 text-[11px] border border-amber-200">
                    🍳 <strong>Folk Secret:</strong> {prod.regionalDetail.folkUseTips}
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart Footer */}
              {sku && (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-[#1c2421]">
                      {formatPaise(sku.sellingPricePaise)}
                    </div>
                    <span className="text-[10px] text-stone-500">
                      Pack: {formatGrams(sku.packageSizeGrams)}
                    </span>
                  </div>

                  {quantity === 0 ? (
                    <button
                      onClick={() =>
                        addItem({
                          skuId: sku.id,
                          productId: prod.id,
                          title: prod.title,
                          slug: prod.slug,
                          imageUrl: prod.featuredImageUrl,
                          sellingPricePaise: sku.sellingPricePaise,
                          mrpPaise: sku.mrpPaise,
                          packageSizeGrams: sku.packageSizeGrams,
                          unitType: sku.unitType,
                        })
                      }
                      className="bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-95 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Basket</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#d8f3dc] border border-[#b7e4c7] rounded-xl p-1 text-xs font-bold text-[#1b4332]">
                      <button
                        onClick={() => updateQuantity(sku.id, quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(sku.id, quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


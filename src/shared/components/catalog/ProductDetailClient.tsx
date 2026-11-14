"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Calendar,
  AlertCircle,
  Clock,
  Heart,
  Share2,
  Package,
  TrendingUp,
} from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";
import { useCart } from "@/shared/context/CartContext";

export interface SerializedProductDetail {
  id: string;
  title: string;
  slug: string;
  scientificName: string | null;
  regionalNamesJson: string;
  description: string;
  originRegion: string | null;
  featuredImageUrl: string;
  galleryUrlsJson: string;
  category: {
    id: string;
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
  storageGuide?: {
    idealStorageMethod: string;
    optimalTempCelsius: string;
    expectedShelfLifeDays: number;
    ethyleneProducer: boolean;
    ethyleneSensitive: boolean;
    prepTip: string;
  } | null;
  regionalDetail?: {
    nativeState: string;
    harvestSeasonText: string;
    flavorProfile: string;
    textureProfile: string;
    culinaryTradition: string;
    folkUseTips: string;
  } | null;
  activeBatch?: {
    batchNumber: string;
    readinessStage: string;
    receivedDate: string;
    bestBeforeDate: string;
    supplierName: string;
    inspection?: {
      overallGrade: string;
      firmnessScore: number;
      blemishScore: number;
      notes: string | null;
    } | null;
  } | null;
}

export const ProductDetailClient: React.FC<{ product: SerializedProductDetail }> = ({
  product,
}) => {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const activeSku = product.skus[selectedSkuIndex] || product.skus[0];
  const cartItem = items.find((i) => i.skuId === activeSku?.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Parse regional names JSON safely
  let regionalNames: Record<string, string> = {};
  try {
    regionalNames = JSON.parse(product.regionalNamesJson);
  } catch (e) {
    regionalNames = {};
  }

  const handleAdd = () => {
    if (!activeSku) return;
    addItem({
      skuId: activeSku.id,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      imageUrl: product.featuredImageUrl,
      sellingPricePaise: activeSku.sellingPricePaise,
      mrpPaise: activeSku.mrpPaise,
      packageSizeGrams: activeSku.packageSizeGrams,
      unitType: activeSku.unitType,
      batchReadiness: product.activeBatch?.readinessStage,
    });
  };

  const getRipenessBadge = (stage?: string) => {
    switch (stage) {
      case "RAW":
        return { label: "Raw (Best for 3-5 days storage or cooking)", color: "bg-yellow-100 text-yellow-900 border-yellow-200" };
      case "TURNING":
        return { label: "Turning (Will be perfectly ripe in 1-2 days)", color: "bg-orange-100 text-orange-900 border-orange-200" };
      case "READY_TO_EAT":
        return { label: "Ready to Eat (Peak ripeness today)", color: "bg-emerald-100 text-emerald-900 border-emerald-200" };
      case "PEAK":
        return { label: "Peak Freshness (Morning inwarded)", color: "bg-teal-100 text-teal-900 border-teal-200" };
      default:
        return { label: "Farm Verified Batch", color: "bg-stone-100 text-stone-900 border-stone-200" };
    }
  };

  const ripenessInfo = getRipenessBadge(product.activeBatch?.readinessStage);

  return (
    <div className="space-y-10">
      {/* Top Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Image & Badges */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 w-full bg-[#f4f1ea] rounded-3xl overflow-hidden border border-[#e8e3d9] shadow-sm">
            <Image
              src={hasError ? "/images/produce-placeholder.svg" : product.featuredImageUrl}
              alt={product.title}
              fill
              unoptimized
              priority
              onError={() => setHasError(true)}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.originRegion && (
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                📍 {product.originRegion}
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#2d6a4f] text-xs font-bold px-3 py-1 rounded-full border border-[#b7e4c7] shadow-sm">
              100% Produce Only
            </div>
          </div>

          {/* Regional Name Badges */}
          {Object.keys(regionalNames).length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e8e3d9] p-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-stone-500">Regional Names:</span>
              {Object.entries(regionalNames).map(([lang, name]) => (
                <span
                  key={lang}
                  className="px-2.5 py-0.5 rounded-md bg-[#f4f1ea] text-stone-800 font-medium"
                >
                  <strong className="capitalize text-stone-500 font-normal">{lang}:</strong> {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pricing, Batch Info & Add to Cart */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">
              {product.category.name}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c2421] tracking-tight">
              {product.title}
            </h1>

            {product.scientificName && (
              <p className="text-xs italic text-stone-500 font-serif">
                Botanical Cultivar: {product.scientificName}
              </p>
            )}

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Verified Inward Batch Box */}
          {product.activeBatch && (
            <div className="bg-white rounded-2xl border border-[#e8e3d9] p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-400">
                  {product.activeBatch.batchNumber}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ripenessInfo.color}`}
                >
                  {ripenessInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1 border-t border-stone-100">
                <div>
                  <span className="text-stone-400 block text-[10px]">Supplier / Origin:</span>
                  <span className="font-semibold text-stone-900">{product.activeBatch.supplierName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Best Before Window:</span>
                  <span className="font-semibold text-stone-900">
                    {new Date(product.activeBatch.bestBeforeDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>

              {product.activeBatch.inspection && (
                <div className="bg-[#fbf9f5] rounded-xl p-2.5 text-[11px] text-stone-600 border border-[#ede9df] flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#2d6a4f]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Inward Gate Inspection Passed
                  </span>
                  <span className="font-mono text-stone-500">
                    Firmness: {product.activeBatch.inspection.firmnessScore}/5 • Blemish: {product.activeBatch.inspection.blemishScore}/5
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pricing & Pack Selection */}
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-5 space-y-4 shadow-xs">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#1c2421]">
                    {formatPaise(activeSku.sellingPricePaise)}
                  </span>
                  {activeSku.mrpPaise > activeSku.sellingPricePaise && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPaise(activeSku.mrpPaise)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500">
                  Price for {formatGrams(activeSku.packageSizeGrams)} pack (incl. all taxes)
                </span>
              </div>

              <span className="bg-[#d8f3dc] text-[#1b4332] text-xs font-bold px-2.5 py-1 rounded-full">
                In Stock • Indiranagar Hub
              </span>
            </div>

            {/* Pack Selector if multiple SKUs exist */}
            {product.skus.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700">Choose Pack Size:</span>
                <div className="flex gap-2">
                  {product.skus.map((sku, idx) => (
                    <button
                      key={sku.id}
                      onClick={() => setSelectedSkuIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSkuIndex === idx
                          ? "border-[#2d6a4f] bg-[#d8f3dc]/40 text-[#1b4332]"
                          : "border-stone-200 text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      {formatGrams(sku.packageSizeGrams)} - {formatPaise(sku.sellingPricePaise)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Basket Action */}
            <div className="pt-2 flex items-center gap-3">
              {quantity === 0 ? (
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Fresh Basket</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between bg-[#d8f3dc] border border-[#b7e4c7] rounded-xl p-2 font-bold text-[#1b4332]">
                  <button
                    onClick={() => updateQuantity(activeSku.id, quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-xs hover:bg-stone-50 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-extrabold">{quantity} in Basket</span>
                  <button
                    onClick={() => updateQuantity(activeSku.id, quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-xs hover:bg-stone-50 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Feature Gateway Links */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/matchmaker"
              className="p-3 bg-white border border-[#e8e3d9] rounded-xl hover:border-[#2d6a4f] transition-colors flex items-center gap-2 text-stone-700"
            >
              <Sparkles className="w-4 h-4 text-[#2d6a4f] shrink-0" />
              <div>
                <span className="font-bold text-[#1c2421] block">Freshness Matchmaker</span>
                <span className="text-[11px] text-stone-500">Pick future usage date</span>
              </div>
            </Link>

            <Link
              href="/market-pulse"
              className="p-3 bg-white border border-[#e8e3d9] rounded-xl hover:border-[#2d6a4f] transition-colors flex items-center gap-2 text-stone-700"
            >
              <TrendingUp className="w-4 h-4 text-stone-600 shrink-0" />
              <div>
                <span className="font-bold text-[#1c2421] block">Market Pulse</span>
                <span className="text-[11px] text-stone-500">APMC price history</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Storage Science & Culinary Tradition Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* Storage Guide (Produce Intelligence) */}
        {product.storageGuide && (
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1c2421]">Storage Science Guide</h3>
                <p className="text-xs text-stone-500">Maximize kitchen shelf life & prevent waste</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ede9df]">
                <span className="text-stone-400 block text-[10px]">Method:</span>
                <span className="font-bold text-stone-900">{product.storageGuide.idealStorageMethod}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ede9df]">
                <span className="text-stone-400 block text-[10px]">Optimal Temperature:</span>
                <span className="font-bold text-stone-900">{product.storageGuide.optimalTempCelsius}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ede9df]">
                <span className="text-stone-400 block text-[10px]">Expected Household Life:</span>
                <span className="font-bold text-[#2d6a4f]">~{product.storageGuide.expectedShelfLifeDays} days</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ede9df]">
                <span className="text-stone-400 block text-[10px]">Ethylene Sensitivity:</span>
                <span className="font-bold text-stone-900">
                  {product.storageGuide.ethyleneSensitive ? "Sensitive (keep separated)" : "Tolerant"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
              💡 <strong>Kitchen Prep Tip:</strong> {product.storageGuide.prepTip}
            </div>
          </div>
        )}

        {/* Regional Heritage & Flavor Profile */}
        {product.regionalDetail && (
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2d6a4f] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1c2421]">Regional Cultivar Heritage</h3>
                <p className="text-xs text-stone-500">Native Indian produce intelligence</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-600">
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ede9df] space-y-1">
                <strong className="text-stone-900 block">Flavor & Texture Profile:</strong>
                <p>{product.regionalDetail.flavorProfile} — {product.regionalDetail.textureProfile}.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ede9df] space-y-1">
                <strong className="text-stone-900 block">Culinary Tradition:</strong>
                <p>{product.regionalDetail.culinaryTradition}</p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900">
                🍳 <strong>Folk Cooking Tip:</strong> {product.regionalDetail.folkUseTips}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Clock, Check, Plus, Minus, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";
import { useCart } from "@/shared/context/CartContext";

interface MatchmakerBatch {
  batchId: string;
  batchNumber: string;
  readinessStage: string;
  bestBeforeDate: string;
  availableQuantityGrams: number;
  supplierName: string;
  matchAdvice: string;
  product: {
    id: string;
    title: string;
    slug: string;
    scientificName: string | null;
    originRegion: string | null;
    featuredImageUrl: string;
    categoryName: string;
  };
  sku: {
    id: string;
    skuCode: string;
    packageSizeGrams: number;
    sellingPricePaise: number;
    mrpPaise: number;
    unitType: string;
  };
  storageAdvice: string;
}

export const MatchmakerClient: React.FC = () => {
  const { items, addItem, updateQuantity } = useCart();
  const [consumptionDate, setConsumptionDate] = useState("IN_2_3_DAYS");
  const [intendedUse, setIntendedUse] = useState<"FRESH_EATING" | "JUICING" | "COOKING" | "STORAGE">("FRESH_EATING");
  const [matches, setMatches] = useState<MatchmakerBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchAdvice, setMatchAdvice] = useState("");

  const fetchMatches = async (date: string, use: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/matchmaker/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumptionDate: date, intendedUse: use }),
      });
      const json = await res.json();
      if (json.success) {
        setMatches(json.data.recommendations);
        setMatchAdvice(json.data.matchAdvice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(consumptionDate, intendedUse);
  }, [consumptionDate, intendedUse]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">Freshness Matchmaker</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8f3dc] text-[#1b4332] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#2d6a4f]" />
          <span>Signature Feature 01</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Freshness Matchmaker
        </h1>
        <p className="text-xs sm:text-sm text-[#d8f3dc]/90 max-w-2xl leading-relaxed">
          Don&apos;t just buy random produce. Tell us when and how you plan to eat, and our cold-chain allocation engine matches batches with verified physical ripeness stages.
        </p>
      </div>

      {/* Interactive Controls Card */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-6">
        {/* Question 1: When do you plan to consume? */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
            1. When do you plan to eat this produce?
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            {[
              { id: "TODAY", label: "⚡ Today", sub: "Ready to eat right away" },
              { id: "TOMORROW", label: "🕒 Tomorrow", sub: "Peak sweetness by morning" },
              { id: "IN_2_3_DAYS", label: "🌱 In 2-3 Days", sub: "Ripens on your counter" },
              { id: "WEEKEND", label: "🗓️ This Weekend", sub: "Slow-maturing hardy batches" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setConsumptionDate(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  consumptionDate === opt.id
                    ? "border-[#2d6a4f] bg-[#d8f3dc]/40 text-[#1b4332] ring-1 ring-[#2d6a4f]"
                    : "border-stone-200 text-stone-700 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="font-bold">{opt.label}</div>
                <div className="text-[11px] text-stone-500 font-normal mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: What is your intended culinary use? */}
        <div className="space-y-2 border-t border-stone-100 pt-4">
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
            2. How will you use it?
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            {[
              { id: "FRESH_EATING", label: "🍎 Eating Fresh", sub: "Tender, juicy, dessert ready" },
              { id: "JUICING", label: "🥤 Juicing & Smoothies", sub: "High yield, tender pulp" },
              { id: "COOKING", label: "🍲 Cooking & Curries", sub: "Firm, holds shape in gravies" },
              { id: "STORAGE", label: "📦 Week-Long Storage", sub: "Maximum shelf life" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setIntendedUse(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  intendedUse === opt.id
                    ? "border-[#2d6a4f] bg-[#d8f3dc]/40 text-[#1b4332] ring-1 ring-[#2d6a4f]"
                    : "border-stone-200 text-stone-700 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="font-bold">{opt.label}</div>
                <div className="text-[11px] text-stone-500 font-normal mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Match Advice Pill */}
        {matchAdvice && (
          <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#ede9df] text-xs text-stone-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2d6a4f] shrink-0" />
            <span><strong>Algorithmic Matching:</strong> {matchAdvice}</span>
          </div>
        )}
      </div>

      {/* Matched Batches Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>
            Found <strong className="text-stone-900">{matches.length}</strong> batches matched with verified ripeness
          </span>
          <span className="text-[11px] font-mono text-[#2d6a4f]">Direct FEFO Darkstore Inwarding</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-stone-500">
            Matching live farm batches...
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-12 text-center space-y-2">
            <h3 className="font-bold text-base text-stone-900">No batches currently match this exact timing</h3>
            <p className="text-xs text-stone-500">
              Try switching your consumption window to browse all verified morning arrivals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const cartItem = items.find((i) => i.skuId === match.sku.id);
              const quantity = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={match.batchId}
                  className="bg-white rounded-2xl border border-[#e8e3d9] overflow-hidden shadow-xs flex flex-col justify-between produce-card p-4 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="relative w-20 h-20 rounded-xl bg-[#f4f1ea] overflow-hidden shrink-0 border border-stone-200">
                        <Image
                          src={match.product.featuredImageUrl}
                          alt={match.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider block">
                          {match.product.categoryName}
                        </span>
                        <Link
                          href={`/product/${match.product.slug}`}
                          className="font-bold text-sm text-[#1c2421] hover:text-[#2d6a4f] transition-colors block truncate"
                        >
                          {match.product.title}
                        </Link>
                        <div className="text-xs text-stone-500 mt-0.5">
                          Pack: {formatGrams(match.sku.packageSizeGrams)} • {formatPaise(match.sku.sellingPricePaise)}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332] px-2 py-0.5 rounded-full">
                          Stage: {match.readinessStage}
                        </span>
                      </div>
                    </div>

                    {/* Batch Verified Meta */}
                    <div className="bg-[#fbf9f5] rounded-xl p-2.5 text-[11px] text-stone-600 border border-[#ede9df] space-y-1">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span>Batch: {match.batchNumber}</span>
                        <span className="text-[#2d6a4f] font-bold">{formatGrams(match.availableQuantityGrams)} stock</span>
                      </div>
                      <div className="text-stone-500">
                        Farm: {match.supplierName} • Best before: {new Date(match.bestBeforeDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Add with Matched Date to Cart */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-[#1c2421]">
                        {formatPaise(match.sku.sellingPricePaise)}
                      </span>
                    </div>

                    {quantity === 0 ? (
                      <button
                        onClick={() =>
                          addItem({
                            skuId: match.sku.id,
                            productId: match.product.id,
                            title: match.product.title,
                            slug: match.product.slug,
                            imageUrl: match.product.featuredImageUrl,
                            sellingPricePaise: match.sku.sellingPricePaise,
                            mrpPaise: match.sku.mrpPaise,
                            packageSizeGrams: match.sku.packageSizeGrams,
                            unitType: match.sku.unitType,
                            batchReadiness: match.readinessStage,
                            consumptionDate,
                          })
                        }
                        className="bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Matched Batch</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#d8f3dc] border border-[#b7e4c7] rounded-xl p-1 text-xs font-bold text-[#1b4332]">
                        <button
                          onClick={() => updateQuantity(match.sku.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(match.sku.id, quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

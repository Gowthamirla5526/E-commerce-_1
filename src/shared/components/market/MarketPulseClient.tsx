"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  Scale,
  Truck,
  Leaf,
  CheckCircle2,
  Info,
  ChevronDown,
} from "lucide-react";

interface PulseItem {
  productId: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string;
  packageSizeGrams: number;
  storeSkuPricePaise: number;
  storePricePerKgPaise: number;
  mandiBenchmarkPaise: number;
  diffPaise: number;
  diffPercentage: number;
  mandiSource: string;
  mandiLocation: string;
  lastObservedDate: string;
  reasonForChange: string;
  breakdown: {
    rawMandiPricePaise: number;
    gradingRejectionLossPaise: number;
    coldChainLogisticsPaise: number;
    sanitizedPackagingPaise: number;
    fairDeliveryPartnerPaise: number;
  };
}

export const MarketPulseClient: React.FC<{
  initialTrends: PulseItem[];
}> = ({ initialTrends }) => {
  const [trends] = useState<PulseItem[]>(initialTrends);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="rounded-3xl bg-stone-900 text-white p-8 md:p-12 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <Scale className="w-3.5 h-3.5" />
            100% Transparent Produce Pricing
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Market Pulse & APMC Mandi Index
          </h1>
          <p className="text-stone-300 text-sm md:text-base leading-relaxed">
            Most grocery apps conceal where your money goes. We compare our doorstep prices directly
            against official wholesale APMC Mandi auction benchmarks, explaining the true cost of
            sorting losses, cold-chain transport, and fair farmer payouts.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
              <span className="text-stone-400 block text-[11px]">Primary Mandi</span>
              <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                Yeshwanthpur APMC
              </span>
            </div>
            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
              <span className="text-stone-400 block text-[11px]">Verification</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                Agmarknet Daily
              </span>
            </div>
            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
              <span className="text-stone-400 block text-[11px]">Farm Gate Loss</span>
              <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                15% Strict Sort QC
              </span>
            </div>
            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
              <span className="text-stone-400 block text-[11px]">Cold Logistics</span>
              <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                Reefer Insulated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Produce Price Transparency Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-bold text-stone-900">
            Daily Produce Transparency Index
          </h2>
          <span className="text-xs text-stone-500">
            Updated daily from Karnataka Horticulture & Mandi bulletins
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {trends.map((item) => {
            const isExpanded = expandedId === item.productId;
            const storeRupeesPerKg = (item.storePricePerKgPaise / 100).toFixed(0);
            const mandiRupeesPerKg = (item.mandiBenchmarkPaise / 100).toFixed(0);

            return (
              <div
                key={item.productId}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all hover:border-stone-300"
              >
                <div
                  onClick={() => toggleExpand(item.productId)}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 max-w-lg">
                        {item.reasonForChange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-stone-400 block font-medium">
                        APMC Wholesale Mandi
                      </span>
                      <span className="text-base font-bold text-stone-700">
                        ₹{mandiRupeesPerKg} <span className="text-xs font-normal">/ kg</span>
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-emerald-700 block font-semibold">
                        Fresh Harvest Doorstep
                      </span>
                      <span className="text-xl font-black text-[#1b4332]">
                        ₹{storeRupeesPerKg} <span className="text-xs font-normal">/ kg</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#2d6a4f] font-semibold bg-[#d8f3dc] px-3 py-1.5 rounded-xl">
                      <span>Why the diff?</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Cost Breakdown Drawer */}
                {isExpanded && (
                  <div className="bg-stone-50/80 border-t border-stone-200 p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                        <Info className="w-4 h-4 text-[#2d6a4f]" />
                        <span>Every Single Rupee Accounted For: Per Kilogram Cost Bridge</span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        Benchmark: {item.mandiSource} ({item.mandiLocation})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Step 1 */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                          <span>1. Raw Mandi Price</span>
                        </div>
                        <div className="text-lg font-black text-stone-900">
                          ₹{(item.breakdown.rawMandiPricePaise / 100).toFixed(2)}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Uncleaned, unsorted bulk auction rate at Mandi yards.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>2. Grading Sort Loss</span>
                        </div>
                        <div className="text-lg font-black text-amber-700">
                          +₹{(item.breakdown.gradingRejectionLossPaise / 100).toFixed(2)}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          15% damaged/bruised produce rejected so you receive 0 blemishes.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>3. Cold Transport</span>
                        </div>
                        <div className="text-lg font-black text-blue-700">
                          +₹{(item.breakdown.coldChainLogisticsPaise / 100).toFixed(2)}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Insulated refrigerated farm-to-darkstore express reefer line.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                          <Scale className="w-3.5 h-3.5 text-teal-600" />
                          <span>4. Zero-Plastic Crate</span>
                        </div>
                        <div className="text-lg font-black text-teal-700">
                          +₹{(item.breakdown.sanitizedPackagingPaise / 100).toFixed(2)}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Washed & sanitized returnable crate handling & packaging.
                        </p>
                      </div>

                      {/* Step 5 */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                          <span>5. Doorstep Delivery</span>
                        </div>
                        <div className="text-lg font-black text-[#1b4332]">
                          +₹{(item.breakdown.fairDeliveryPartnerPaise / 100).toFixed(2)}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Living-wage rider compensation & verified darkstore dispatch.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


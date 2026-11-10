"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Sparkles,
  Users,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";
import { useCart } from "@/shared/context/CartContext";

interface PlanItem {
  skuId: string;
  productId: string;
  title: string;
  slug: string;
  imageUrl: string;
  packageSizeGrams: number;
  sellingPricePaise: number;
  mrpPaise: number;
  unitType: string;
  totalRequiredGrams: number;
  inFridgeGrams: number;
  packsToBuy: number;
  costPaise: number;
}

interface PlanDay {
  dayNumber: number;
  dayName: string;
  meals: Array<{
    mealCategory: string;
    recipeTitle: string;
    prepTimeMinutes: number;
    ingredients: Array<{
      productTitle: string;
      requiredGrams: number;
      inFridgeStatus: boolean;
      sellingPricePaise: number;
    }>;
  }>;
}

export const FreshPlanClient: React.FC = () => {
  const { addItem } = useCart();
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietType, setDietType] = useState<"VEGETARIAN" | "VEGAN">("VEGETARIAN");
  const [days, setDays] = useState<PlanDay[]>([]);
  const [shoppingBasket, setShoppingBasket] = useState<PlanItem[]>([]);
  const [totalCostPaise, setTotalCostPaise] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const fetchPlan = async (size: number, diet: string) => {
    setIsLoading(true);
    setAddedSuccess(false);
    try {
      const res = await fetch("/api/v1/fresh-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdSize: size, dietType: diet }),
      });
      const json = await res.json();
      if (json.success) {
        setDays(json.data.days);
        setShoppingBasket(json.data.shoppingBasket);
        setTotalCostPaise(json.data.totalPlanCostPaise);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan(householdSize, dietType);
  }, [householdSize, dietType]);

  const handleAddAllToCart = () => {
    shoppingBasket.forEach((item) => {
      addItem({
        skuId: item.skuId,
        productId: item.productId,
        title: item.title,
        slug: item.slug,
        imageUrl: item.imageUrl,
        sellingPricePaise: item.sellingPricePaise,
        mrpPaise: item.mrpPaise,
        packageSizeGrams: item.packageSizeGrams,
        unitType: item.unitType,
      }, item.packsToBuy);
    });
    setAddedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">Seven-Day Fresh Plan</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8f3dc] text-[#1b4332] text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-[#2d6a4f]" />
          <span>Signature Feature 03</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Seven-Day Fresh Plan
        </h1>
        <p className="text-xs sm:text-sm text-[#d8f3dc]/90 max-w-2xl leading-relaxed">
          Produce-first weekly meal planning engine. We calculate exact fruit and vegetable requirements, subtract what&apos;s already in your fridge, and build the leanest zero-waste grocery basket.
        </p>
      </div>

      {/* Household Configurator Card */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2d6a4f]" />
            <span className="text-xs font-bold text-stone-700">Household Size:</span>
            <div className="flex gap-1.5">
              {[1, 2, 4, 6].map((s) => (
                <button
                  key={s}
                  onClick={() => setHouseholdSize(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    householdSize === s
                      ? "bg-[#2d6a4f] text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {s} {s === 1 ? "Person" : "People"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#2d6a4f]" />
            <span className="text-xs font-bold text-stone-700">Diet:</span>
            <div className="flex gap-1.5">
              {(["VEGETARIAN", "VEGAN"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDietType(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dietType === d
                      ? "bg-[#2d6a4f] text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchPlan(householdSize, dietType)}
          className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate Meal Schedule</span>
        </button>
      </div>

      {/* Plan & Shopping Basket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 7 Days Meal Schedule */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1c2421]">7-Day Cooking & Produce Schedule</h3>
            <span className="text-xs text-stone-500">Stock-Aware Recipe Selection</span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-stone-500">
              Generating balanced 7-day produce meal plan...
            </div>
          ) : (
            <div className="space-y-4">
              {days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="bg-white rounded-2xl border border-[#e8e3d9] p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-sm text-[#1c2421]">{day.dayName}</span>
                    <span className="text-[11px] font-semibold text-[#2d6a4f] bg-[#d8f3dc] px-2.5 py-0.5 rounded-full">
                      3 Produce Meals
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {day.meals.map((meal) => (
                      <div
                        key={meal.mealCategory}
                        className="p-3 bg-[#fbf9f5] rounded-xl border border-[#ede9df] text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400">
                            {meal.mealCategory}
                          </span>
                          <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-[#2d6a4f]" /> {meal.prepTimeMinutes}m
                          </span>
                        </div>

                        <span className="font-semibold text-stone-900 block leading-tight">
                          {meal.recipeTitle}
                        </span>

                        <div className="pt-1 space-y-1">
                          {meal.ingredients.map((ing, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-[11px] text-stone-600"
                            >
                              <span>{ing.productTitle}</span>
                              <span className={ing.inFridgeStatus ? "text-[#2d6a4f] font-semibold" : "text-stone-700 font-medium"}>
                                {formatGrams(ing.requiredGrams)} {ing.inFridgeStatus && "✓ in fridge"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Consolidated Produce Shopping List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-[#1c2421]">Net Shopping Basket</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Exact quantities needed after deducting in-fridge stock
              </p>
            </div>

            <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto space-y-2 pr-1">
              {shoppingBasket.map((item) => (
                <div key={item.skuId} className="pt-2 first:pt-0 flex justify-between text-xs items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 block truncate max-w-[140px]">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {item.packsToBuy} pack ({formatGrams(item.packageSizeGrams * item.packsToBuy)})
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-stone-900">{formatPaise(item.costPaise)}</span>
                </div>
              ))}
            </div>

            {/* Total Cost & Add All Action */}
            <div className="border-t border-stone-200 pt-3 space-y-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] text-stone-500 block">Estimated 7-Day Produce</span>
                  <span className="text-xl font-extrabold text-[#1c2421]">
                    {formatPaise(totalCostPaise)}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">Zero duplicate items</span>
              </div>

              {addedSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All produce added to your basket! Check drawer to review.</span>
                </div>
              ) : (
                <button
                  onClick={handleAddAllToCart}
                  className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add All to Basket ({shoppingBasket.length} packs)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


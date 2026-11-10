"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";

export const HomeCategoriesClient: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="categories" className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t("popularCategories")}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {t("popularCategoriesSub")}
          </p>
        </div>
        <Link
          href="/vegetables"
          className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{t("viewAllCategories")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 6 Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Fresh Fruits */}
        <Link
          href="/fruits"
          className="bg-white rounded-2xl border border-stone-200 p-3.5 hover:border-[#2d6a4f] hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-20 h-20 rounded-full bg-[#fef2f2] flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
            <span className="text-4xl">🍎</span>
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#2d6a4f] transition-colors">
              {t("fruits")}
            </h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">23+ Varieties</p>
          </div>
        </Link>

        {/* 2. Fresh Vegetables */}
        <Link
          href="/vegetables"
          className="bg-white rounded-2xl border border-stone-200 p-3.5 hover:border-[#2d6a4f] hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-20 h-20 rounded-full bg-[#f0fdf4] flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
            <span className="text-4xl">🥕</span>
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#2d6a4f] transition-colors">
              {t("vegetables")}
            </h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">26+ Farm SKUs</p>
          </div>
        </Link>

        {/* 3. Exotic Fruits */}
        <Link
          href="/fruits"
          className="bg-white rounded-2xl border border-stone-200 p-3.5 hover:border-[#2d6a4f] hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-20 h-20 rounded-full bg-[#fefce8] flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
            <span className="text-4xl">🥑</span>
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#2d6a4f] transition-colors">
              Exotic Fruits
            </h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Avocados, Kiwis & Berries</p>
          </div>
        </Link>

        {/* 4. Leafy Greens & Leaves */}
        <Link
          href="/leafy"
          className="bg-white rounded-2xl border border-stone-200 p-3.5 hover:border-[#2d6a4f] hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-20 h-20 rounded-full bg-[#ecfdf5] flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
            <span className="text-4xl">🥬</span>
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#2d6a4f] transition-colors">
              {t("leafy")}
            </h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">13+ Crisp Varieties</p>
          </div>
        </Link>

        {/* 5. Organic Roots & Greens */}
        <Link
          href="/vegetables"
          className="bg-white rounded-2xl border border-stone-200 p-3.5 hover:border-[#2d6a4f] hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-20 h-20 rounded-full bg-[#fdf4ff] flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
            <span className="text-4xl">🌱</span>
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#2d6a4f] transition-colors">
              Organic Produce
            </h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Zero Chemical Produce</p>
          </div>
        </Link>

        {/* 6. Seasonal Harvest Fruits */}
        <Link
          href="/fruits"
          className="bg-white rounded-2xl border border-stone-200 p-3.5 hover:border-[#2d6a4f] hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2.5"
        >
          <div className="w-20 h-20 rounded-full bg-[#fff7ed] flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
            <span className="text-4xl">🥭</span>
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#2d6a4f] transition-colors">
              Seasonal Orchard
            </h3>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Devgad Mangoes & Melons</p>
          </div>
        </Link>
      </div>
    </section>
  );
};

export const TodaysPicksHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200/80 pb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]"></span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t("todaysPicks")}
          </h2>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          {t("todaysPicksSub")}
        </p>
      </div>

      <Link
        href="/vegetables"
        className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
      >
        <span>{t("viewAllCategories")}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};


"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Leaf } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { formatPaise, formatGrams } from "@/core/types";
import { SerializedProduct } from "@/shared/components/catalog/WeeklyBestsellersClient";

interface HomeHeroClientProps {
  heroFeaturedProduct?: SerializedProduct | null;
}

export const HomeHeroClient: React.FC<HomeHeroClientProps> = ({
  heroFeaturedProduct,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3b25] via-[#1b4332] to-[#2d6a4f] text-white shadow-xl mt-4">
        {/* Subtle decorative radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#52b788]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#d8f3dc]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-14">
          {/* Left Text & CTA Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d8f3dc]/20 text-[#d8f3dc] text-xs font-bold tracking-wide backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
              <span>{t("produceOnly")}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
                {t("heroTitle")}
              </h1>
              <p className="text-base sm:text-lg text-[#d8f3dc]/90 max-w-xl leading-relaxed">
                {t("heroSubtitle")}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="#todays-picks"
                className="bg-white text-[#1b4332] hover:bg-[#d8f3dc] text-sm font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{t("shopNow")}</span>
                <ArrowRight className="w-4 h-4 text-[#1b4332]" />
              </Link>

              <Link
                href="/fruits"
                className="bg-[#2d6a4f]/70 hover:bg-[#2d6a4f] text-white border border-white/20 text-sm font-bold px-6 py-3.5 rounded-xl transition-all backdrop-blur-xs flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{t("exploreProduce")}</span>
              </Link>
            </div>

            {/* Service & Quality Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/15 text-xs text-[#d8f3dc]">
              <div>
                <div className="font-extrabold text-sm sm:text-base text-white">06:30 AM</div>
                <div className="text-[11px] text-[#d8f3dc]/80">{t("morningExpressBadge")}</div>
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-white">100% Inspected</div>
                <div className="text-[11px] text-[#d8f3dc]/80">Inward Gate Verification</div>
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-white">₹0 Plastic</div>
                <div className="text-[11px] text-[#d8f3dc]/80">{t("crates")}</div>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Produce Imagery & Featured Product Teaser */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group">
              <Image
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh handpicked organic fruits and vegetables basket"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Corner Badge */}
              <div className="absolute top-3 left-3 bg-[#15803d] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Farm-Harvested at Dawn
              </div>

              {/* Bottom Overlaid Product Teaser */}
              {heroFeaturedProduct && (
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 text-stone-900 shadow-xl flex items-center justify-between border border-white/40">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-[#fefce8] shrink-0 overflow-hidden p-1 border border-amber-200">
                      <Image
                        src={heroFeaturedProduct.featuredImageUrl}
                        alt={heroFeaturedProduct.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#15803d] uppercase tracking-wider">
                        {t("todaysPicks")}
                      </div>
                      <div className="text-xs font-black text-stone-900 line-clamp-1">
                        {heroFeaturedProduct.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                        <span>{formatPaise(heroFeaturedProduct.sku.sellingPricePaise)}</span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          / {formatGrams(heroFeaturedProduct.sku.packageSizeGrams)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/product/${heroFeaturedProduct.slug}`}
                    className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    {t("viewDetails")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMOTIONAL BANNERS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* CARD 1: New Here? */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] border border-[#a5d6a7] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
          <div className="space-y-2 relative z-10">
            <span className="inline-block bg-[#1b4332] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {t("welcomeBenefit")}
            </span>
            <h3 className="text-lg font-black text-[#1b4332] leading-snug">
              {t("welcomeTitle")}
            </h3>
            <p className="text-xs text-[#2e7d32] leading-relaxed">
              {t("welcomeDesc")}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between relative z-10">
            <Link
              href="/vegetables"
              className="inline-flex items-center gap-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <span>{t("exploreProduce")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
              🍋
            </span>
          </div>
        </div>

        {/* CARD 2: Freshness Delivered to Your Door */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] border border-[#ffe082] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
          <div className="space-y-2 relative z-10">
            <span className="inline-block bg-[#e65100] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {t("morningExpressBadge")}
            </span>
            <h3 className="text-lg font-black text-[#e65100] leading-snug">
              {t("morningExpressTitle")}
            </h3>
            <p className="text-xs text-[#b54a00] leading-relaxed">
              {t("morningExpressDesc")}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between relative z-10">
            <Link
              href="/vegetables"
              className="inline-flex items-center gap-1.5 bg-[#e65100] hover:bg-[#bf360c] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <span>{t("shopNow")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
              🚚
            </span>
          </div>
        </div>

        {/* CARD 3: Better Choices for Your Family */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] border border-[#7dd3fc] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
          <div className="space-y-2 relative z-10">
            <span className="inline-block bg-[#0369a1] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {t("verifiedFamilyBadge")}
            </span>
            <h3 className="text-lg font-black text-[#0369a1] leading-snug">
              {t("verifiedFamilyTitle")}
            </h3>
            <p className="text-xs text-[#075985] leading-relaxed">
              {t("verifiedFamilyDesc")}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between relative z-10">
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-1.5 bg-[#0369a1] hover:bg-[#0284c7] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <span>{t("viewDetails")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
              🍎
            </span>
          </div>
        </div>
      </section>
    </>
  );
};


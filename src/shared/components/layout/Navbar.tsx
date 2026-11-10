"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  Refrigerator,
  Compass,
  Package,
  CalendarDays,
  User,
  LogOut,
  Search,
  MapPin,
  Clock,
  Menu,
  X,
  ShieldCheck,
  Heart,
  Percent,
  Home,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/shared/context/CartContext";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { LanguageSelector } from "@/shared/components/layout/LanguageSelector";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSession, setUserSession] = useState<{ name: string; role: string } | null>(null);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.isAuthenticated && data.role === "USER") {
          setUserSession(data.user);
        } else {
          setUserSession(null);
        }
      })
      .catch(() => setUserSession(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/customer-logout", { method: "POST" });
      setUserSession(null);
      router.push("/account/login");
      router.refresh();
    } catch (e) {
      console.warn("Logout failed", e);
    }
  };

  // Do not display customer navigation on any admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#fbf9f5] border-b border-[#e8e3d9] shadow-xs">
        {/* Top Quality & Slot Announcement */}
        <div className="bg-[#1b4332] text-[#d8f3dc] text-xs py-1.5 px-4 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#52b788] animate-pulse"></span>
            <span>{t("morningVerified")}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs opacity-90">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {t("nextCutoff")}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#52b788]" /> {t("produceOnly")}
            </span>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Identity */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-[#1b4332] transition-colors">
                  🥬
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-[#1c2421] block leading-none">
                    {t("brandName")}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-[#2d6a4f] block mt-1">
                    {t("tagline")}
                  </span>
                </div>
              </Link>

              {/* Serviceability / Slot Pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#f3efe6] rounded-lg border border-[#e5dfd3] text-xs text-[#2b332e]">
                <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span className="font-semibold text-[#1c2421]">Bengaluru 560038</span>
                <span className="text-stone-400">|</span>
                <span className="text-[#2d6a4f] font-medium">{t("slot")}</span>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e0dacf] rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] transition-all"
                />
              </div>
            </form>

            {/* Action Icons, Language Selector & Utilities */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Language Selector (English / Hindi / Kannada) */}
              <LanguageSelector variant="header" />

              {/* Wishlist Shortcut */}
              <Link
                href="/wishlist"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1c2421] bg-white border border-[#e0dacf] rounded-lg hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
                title="Wishlist"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden md:inline">Wishlist</span>
              </Link>

              {/* Shopping Cart Pill */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#2d6a4f] text-white rounded-lg text-xs font-semibold hover:bg-[#1b4332] transition-colors shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{t("cart")}</span>
                <span className="bg-[#52b788] text-[#1b4332] px-1.5 py-0.2 rounded-full text-[11px] font-bold">
                  {totalItems}
                </span>
              </button>

              {/* Customer Authentication & Profile */}
              {userSession ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-[#d8f3dc] hover:text-[#1b4332] rounded-lg transition-colors font-semibold"
                    title={t("settings")}
                  >
                    <User className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span className="hidden md:inline">{userSession.name.split(" ")[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title={t("signOut")}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/account/login"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors font-medium"
                >
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden md:inline">{t("signIn")}</span>
                </Link>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* User-Centric Sub-Navigation: Clean, shopping-focused */}
          <nav className="hidden lg:flex items-center justify-between border-t border-[#ede9df] mt-3 pt-2 text-xs font-semibold text-[#2b332e]">
            {/* Left: Direct Produce Shopping Links */}
            <div className="flex items-center gap-5">
              <Link
                href="/"
                className={`transition-colors flex items-center gap-1.5 py-1 font-bold ${
                  pathname === "/"
                    ? "text-[#2d6a4f] bg-[#d8f3dc]/70 px-2.5 py-1 rounded-lg"
                    : "text-stone-700 hover:text-[#2d6a4f]"
                }`}
              >
                <Home className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>{t("home")}</span>
              </Link>
              <Link
                href="/fruits"
                className={`transition-colors flex items-center gap-1 py-1 ${
                  pathname === "/fruits" ? "text-[#2d6a4f] font-bold" : "hover:text-[#2d6a4f]"
                }`}
              >
                <span>🍎 {t("fruits")}</span>
              </Link>
              <Link
                href="/vegetables"
                className={`transition-colors flex items-center gap-1 py-1 ${
                  pathname === "/vegetables" ? "text-[#2d6a4f] font-bold" : "hover:text-[#2d6a4f]"
                }`}
              >
                <span>🥕 {t("vegetables")}</span>
              </Link>
              <Link
                href="/leafy"
                className={`transition-colors flex items-center gap-1 py-1 ${
                  pathname === "/leafy" ? "text-[#2d6a4f] font-bold" : "hover:text-[#2d6a4f]"
                }`}
              >
                <span>🌿 {t("leafy")}</span>
              </Link>
              <Link
                href="#weekly-bestsellers"
                className="hover:text-[#2d6a4f] transition-colors flex items-center gap-1 py-1 text-amber-700"
              >
                <Percent className="w-3 h-3 text-amber-600" />
                <span>{t("deals")}</span>
              </Link>
            </div>

            {/* Right: Orders & User Settings Hub */}
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/account/orders"
                className="flex items-center gap-1.5 py-1 text-stone-700 hover:text-[#2d6a4f] transition-colors font-semibold"
              >
                <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>{t("trackOrders")}</span>
              </Link>

              <Link
                href="/account"
                className="flex items-center gap-1.5 py-1 text-stone-700 hover:text-[#2d6a4f] transition-colors font-semibold"
              >
                <Settings className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>{t("settings")}</span>
              </Link>

              {/* More Produce Tools Dropdown (Keeps Nav Clean) */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
                  onBlur={() => setTimeout(() => setIsMoreToolsOpen(false), 200)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f3efe6] hover:bg-[#e8e3d9] text-[#1b4332] font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>{t("produceTools")}</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>

                {isMoreToolsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#e8e3d9] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      href="/matchmaker"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#fbf9f5] text-stone-800 text-xs font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#2d6a4f]" />
                      <span>{t("matchmaker")}</span>
                    </Link>
                    <Link
                      href="/fridge"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#fbf9f5] text-stone-800 text-xs font-semibold"
                    >
                      <Refrigerator className="w-3.5 h-3.5 text-[#e85d04]" />
                      <span>{t("fridgeTracker")}</span>
                    </Link>
                    <Link
                      href="/fresh-plan"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#fbf9f5] text-stone-800 text-xs font-semibold"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                      <span>{t("freshPlan")}</span>
                    </Link>
                    <Link
                      href="/packaging"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#fbf9f5] text-stone-800 text-xs font-semibold"
                    >
                      <Package className="w-3.5 h-3.5 text-stone-600" />
                      <span>{t("crates")}</span>
                    </Link>
                    <Link
                      href="/regional"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#fbf9f5] text-stone-800 text-xs font-semibold"
                    >
                      <Compass className="w-3.5 h-3.5 text-stone-600" />
                      <span>Regional Explorer</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#e8e3d9] px-4 pt-3 pb-6 space-y-4">
            {/* Mobile Language Switcher */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {t("languageLabel")}:
              </span>
              <LanguageSelector variant="mobile" />
            </div>

            <form
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setMobileMenuOpen(false);
              }}
              className="relative"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#fbf9f5] border border-[#e0dacf] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#2d6a4f]"
              />
            </form>

            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#d8f3dc]/60 text-[#1b4332] flex items-center gap-1.5 font-bold"
              >
                <Home className="w-4 h-4 text-[#2d6a4f]" />
                <span>{t("home")}</span>
              </Link>
              <Link
                href="/fruits"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#fbf9f5] text-[#1c2421]"
              >
                🍎 {t("fruits")}
              </Link>
              <Link
                href="/vegetables"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#fbf9f5] text-[#1c2421]"
              >
                🥕 {t("vegetables")}
              </Link>
              <Link
                href="/leafy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-[#fbf9f5] text-[#1c2421]"
              >
                🌿 {t("leafy")}
              </Link>
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2 text-sm">
              <Link
                href="/account/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 text-stone-800 font-semibold"
              >
                <Clock className="w-4 h-4 text-[#2d6a4f]" />
                <span>{t("trackOrders")}</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 text-stone-800 font-semibold"
              >
                <Settings className="w-4 h-4 text-[#2d6a4f]" />
                <span>{t("settings")}</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

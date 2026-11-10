"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, Clock, Settings } from "lucide-react";
import { useCart } from "@/shared/context/CartContext";
import { useLanguage } from "@/core/i18n/LanguageContext";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, subtotalPaise, setIsCartDrawerOpen } = useCart();
  const { t } = useLanguage();

  // Hide mobile shopping bottom navigation on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: t("home"), href: "/", icon: Home },
    { label: t("shop"), href: "/vegetables", icon: Grid },
    { label: t("trackOrders"), href: "/account/orders", icon: Clock },
    { label: t("settings"), href: "/account", icon: Settings },
  ];

  return (
    <>
      {/* Floating Cart Pill (Reference Screenshot Style) */}
      {totalItems > 0 && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="pointer-events-auto bg-gradient-to-r from-[#2d6a4f] via-[#1b4332] to-[#2d6a4f] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-transform border border-white/20 backdrop-blur-md animate-bounce-once"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Produce Basket</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
              <span>
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
            <span className="text-xs font-black bg-[#52b788] text-[#1b4332] px-2 py-0.5 rounded-full ml-1">
              ₹{(subtotalPaise / 100).toFixed(0)}
            </span>
          </button>
        </div>
      )}

      {/* Streamlined Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8e3d9] py-1 px-2 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive
                    ? "text-[#2d6a4f] font-bold"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold text-stone-700 hover:text-[#2d6a4f] relative cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#2d6a4f] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>
        </div>
      </nav>
    </>
  );
};

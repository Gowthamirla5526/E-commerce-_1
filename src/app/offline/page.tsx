"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ShoppingCart, Refrigerator } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            You are Currently Offline
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            We cannot reach our Indiranagar darkstore servers right now. Don&apos;t worry—your cart items and household fridge tracker are preserved safely on your device.
          </p>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-left space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Offline Available Features
          </span>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#2d6a4f]" />
              Persistent Shopping Cart
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
              Ready
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-2">
              <Refrigerator className="w-4 h-4 text-[#2d6a4f]" />
              Household Fridge Inventory
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
              Cached
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/cart"
            className="w-full py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Saved Cart</span>
          </Link>

          <button
            onClick={handleReload}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}

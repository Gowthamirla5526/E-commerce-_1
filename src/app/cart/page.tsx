"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Package,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/shared/context/CartContext";
import { formatPaise, formatGrams } from "@/core/types";

export default function CartPage() {
  const { items, totalItems, subtotalPaise, updateQuantity, removeItem } =
    useCart();

  const FREE_DELIVERY_THRESHOLD = 49900; // ₹499 in paise
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotalPaise);
  const deliveryFee = amountToFreeDelivery === 0 ? 0 : 2900;
  const packagingDeposit = items.length > 0 ? 10000 : 0; // ₹100 crate deposit
  const totalPayable = subtotalPaise + deliveryFee + packagingDeposit;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#f3efe6] mx-auto flex items-center justify-center text-4xl shadow-inner">
          🥬
        </div>
        <h1 className="text-2xl font-bold text-[#1c2421]">Your basket is empty</h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          You haven&apos;t added any fresh fruits or vegetables yet. Explore today&apos;s morning harvest sorted by hand and batched by ripeness.
        </p>
        <Link
          href="/vegetables"
          className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
        >
          <span>Browse Today&apos;s Harvest</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#1c2421] font-semibold">Shopping Basket ({totalItems})</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Basket Items & Delivery Slot Notice */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1c2421] block">
                  Delivery Slot: Early Bird Morning (06:30 - 09:30 AM)
                </span>
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2d6a4f]" /> Delivering to Bengaluru 560038
                </span>
              </div>
            </div>
            <span className="bg-[#d8f3dc] text-[#1b4332] text-xs font-semibold px-2.5 py-1 rounded-full">
              Cold-Chain Secured
            </span>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-[#e8e3d9] overflow-hidden shadow-xs divide-y divide-[#ede9df]">
            {items.map((item) => (
              <div
                key={item.skuId}
                className="p-4 sm:p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-18 h-18 rounded-xl bg-[#f4f1ea] overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-bold text-sm text-[#1c2421] hover:text-[#2d6a4f] transition-colors block truncate"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Pack: {formatGrams(item.packageSizeGrams)} • {formatPaise(item.sellingPricePaise)} / pack
                    </div>
                    {item.batchReadiness && (
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-[#d8f3dc] text-[#1b4332] px-2 py-0.5 rounded-full">
                        {item.batchReadiness}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Quantity & Total */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-2 bg-[#f3efe6] border border-[#e5dfd3] rounded-xl p-1 text-xs font-bold">
                    <button
                      onClick={() => updateQuantity(item.skuId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right w-20">
                    <div className="font-extrabold text-sm text-[#1c2421]">
                      {formatPaise(item.sellingPricePaise * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="text-stone-400 hover:text-red-600 text-xs mt-1 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bill Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#1c2421]">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-stone-600 border-b border-stone-100 pb-4">
              <div className="flex justify-between">
                <span>Produce Items Subtotal ({totalItems})</span>
                <span className="font-bold text-stone-900">{formatPaise(subtotalPaise)}</span>
              </div>

              <div className="flex justify-between">
                <span>Morning Cold-Chain Delivery</span>
                <span className={`font-bold ${deliveryFee === 0 ? "text-[#2d6a4f]" : "text-stone-900"}`}>
                  {deliveryFee === 0 ? "FREE" : "₹29"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span>Returnable Crate Deposit</span>
                  <span className="text-[10px] bg-stone-100 px-1.5 py-0.2 rounded text-stone-500 font-semibold">
                    Refundable
                  </span>
                </span>
                <span className="font-bold text-stone-900">{formatPaise(packagingDeposit)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-xs text-stone-500 block">Total Payable</span>
                <span className="text-2xl font-extrabold text-[#1c2421]">
                  {formatPaise(totalPayable)}
                </span>
              </div>
              <span className="text-[10px] text-stone-400">All Taxes Included</span>
            </div>

            {/* Circular Packaging Callout */}
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#ede9df] text-xs text-stone-600 flex items-start gap-2.5">
              <Package className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
              <span>
                <strong>100% Circular:</strong> The ₹100 crate deposit is credited back instantly upon hand-off during your next delivery.
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


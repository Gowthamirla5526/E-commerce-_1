"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Package } from "lucide-react";
import { useCart } from "@/shared/context/CartContext";
import { formatPaise, formatGrams } from "@/core/types";

export const CartDrawer: React.FC = () => {
  const pathname = usePathname();
  const {
    items,
    totalItems,
    subtotalPaise,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isCartDrawerOpen || pathname?.startsWith("/admin")) return null;

  const FREE_DELIVERY_THRESHOLD = 49900; // ₹499 in paise
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotalPaise);
  const freeDeliveryProgress = Math.min(
    100,
    Math.round((subtotalPaise / FREE_DELIVERY_THRESHOLD) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fbf9f5] shadow-2xl flex flex-col border-l border-[#e8e3d9]">
          {/* Header */}
          <div className="p-4 bg-white border-b border-[#e8e3d9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#2d6a4f]" />
              <h2 className="font-bold text-base text-[#1c2421]">Your Fresh Basket</h2>
              <span className="bg-[#d8f3dc] text-[#1b4332] text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems} items
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="bg-[#f3efe6] px-4 py-2.5 border-b border-[#ede9df] text-xs">
            {amountToFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-stone-700">
                  <span>Add <strong className="text-[#2d6a4f]">{formatPaise(amountToFreeDelivery)}</strong> more for FREE delivery</span>
                  <span className="font-semibold text-stone-500">{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full bg-stone-300 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#2d6a4f] h-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#2d6a4f] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>🎉 You&apos;ve unlocked FREE Morning Slot Delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f3efe6] mx-auto flex items-center justify-center text-3xl">
                  🥬
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1c2421]">Your basket is empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Explore today&apos;s fresh morning harvest from Kolar, Mysuru and Ooty farms.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="bg-[#2d6a4f] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1b4332] transition-colors"
                >
                  Browse Fresh Produce
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.skuId}
                  className="bg-white rounded-xl border border-[#e8e3d9] p-3 flex gap-3 shadow-xs items-center"
                >
                  <div className="relative w-16 h-16 rounded-lg bg-[#f4f1ea] overflow-hidden shrink-0">
                    <Image
                      src={item.imageUrl || "/images/produce-placeholder.svg"}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-[#1c2421] truncate">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Pack: {formatGrams(item.packageSizeGrams)}
                    </div>
                    {item.batchReadiness && (
                      <span className="inline-block text-[10px] bg-[#d8f3dc] text-[#1b4332] px-1.5 py-0.2 rounded font-medium mt-1">
                        {item.batchReadiness}
                      </span>
                    )}
                    <div className="text-xs font-bold text-[#1c2421] mt-1">
                      {formatPaise(item.sellingPricePaise * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#f3efe6] border border-[#e5dfd3] rounded-lg p-0.5 text-xs font-semibold">
                      <button
                        onClick={() => updateQuantity(item.skuId, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-white rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-white rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-[#e8e3d9] space-y-3">
              {/* Circular Crate Notice */}
              <div className="p-2.5 bg-[#d8f3dc]/50 rounded-lg border border-[#b7e4c7] text-[11px] text-[#1b4332] flex items-center gap-2">
                <Package className="w-4 h-4 shrink-0 text-[#2d6a4f]" />
                <span>
                  Delivered in reusable crate (₹100 refundable deposit). Returned on next delivery.
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Produce Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPaise(subtotalPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[#2d6a4f]">
                    {amountToFreeDelivery === 0 ? "FREE" : "₹29"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#ede9df] pt-2 flex justify-between items-baseline">
                <div>
                  <div className="text-[11px] text-stone-500">Estimated Total</div>
                  <div className="text-lg font-extrabold text-[#1c2421]">
                    {formatPaise(subtotalPaise + (amountToFreeDelivery === 0 ? 0 : 2900))}
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


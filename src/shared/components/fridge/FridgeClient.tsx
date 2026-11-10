"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Refrigerator,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { formatGrams } from "@/core/types";

interface HouseholdItem {
  id: string;
  customName: string;
  quantityGrams: number;
  purchasedDate: string;
  estimatedExpiryDate: string;
  status: string;
  notes: string | null;
  product?: {
    title: string;
    featuredImageUrl: string;
    storageGuide?: {
      idealStorageMethod: string;
      prepTip: string;
    } | null;
  } | null;
}

export const FridgeClient: React.FC<{ initialItems: HouseholdItem[] }> = ({
  initialItems,
}) => {
  const [items, setItems] = useState<HouseholdItem[]>(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [quantityGrams, setQuantityGrams] = useState(500);
  const [expiryDays, setExpiryDays] = useState(4);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeItems = items.filter((i) => i.status === "IN_FRIDGE");
  const consumedItems = items.filter((i) => i.status === "CONSUMED");
  const discardedItems = items.filter((i) => i.status === "DISCARDED");

  const totalGramsInFridge = activeItems.reduce((sum, i) => sum + i.quantityGrams, 0);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/fridge/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customName,
          quantityGrams: Number(quantityGrams),
          expiryDays: Number(expiryDays),
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setItems([json.data, ...items]);
        setShowAddForm(false);
        setCustomName("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkConsumed = async (id: string, qty: number) => {
    try {
      const res = await fetch(`/api/v1/fridge/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONSUMED", quantityConsumedGrams: qty }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "CONSUMED" } : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkDiscarded = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/fridge/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISCARDED", discardReason: "SPOILED" }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "DISCARDED" } : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getDaysLeft = (expiryDateStr: string) => {
    const diff = new Date(expiryDateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">My Fridge Intelligence</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2d6a4f] via-[#1b4332] to-[#2d6a4f] rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8f3dc] text-[#1b4332] text-xs font-bold uppercase tracking-wider">
          <Refrigerator className="w-3.5 h-3.5 text-[#2d6a4f]" />
          <span>Signature Feature 02</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          My Fridge Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#d8f3dc]/90 max-w-2xl leading-relaxed">
          Manage the fresh fruits and vegetables you already have at home. We track estimated usage windows and alert you before duplicate purchasing.
        </p>
      </div>

      {/* Insights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e8e3d9] rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Current Inventory</span>
          <span className="text-2xl font-extrabold text-[#2d6a4f] block mt-1">
            {formatGrams(totalGramsInFridge)}
          </span>
          <span className="text-[11px] text-stone-400">{activeItems.length} active produce items</span>
        </div>

        <div className="bg-white border border-[#e8e3d9] rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Consumed Produce</span>
          <span className="text-2xl font-extrabold text-emerald-700 block mt-1">
            {consumedItems.length} Items Saved
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Zero-waste meal cooked</span>
        </div>

        <div className="bg-white border border-[#e8e3d9] rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Food Waste Prevention</span>
          <span className="text-2xl font-extrabold text-stone-900 block mt-1">
            {discardedItems.length === 0 ? "100% Rate" : `${discardedItems.length} Discarded`}
          </span>
          <span className="text-[11px] text-stone-400">Tracked to eliminate kitchen spoilage</span>
        </div>
      </div>

      {/* Smart Notification Alert if item expiring soon */}
      {activeItems.some((i) => getDaysLeft(i.estimatedExpiryDate) <= 2) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-sm block">Kitchen Consumption Reminder</strong>
            <p className="leading-relaxed">
              You have produce approaching its estimated peak freshness in your crisper drawer. Consider using them in today&apos;s meals before purchasing duplicate quantities.
            </p>
          </div>
        </div>
      )}

      {/* Produce Inventory Management Card */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#1c2421]">Produce in Your Fridge</h3>
            <p className="text-xs text-stone-500">Live household shelf-life tracking</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "Close Form" : "Add Produce Manually"}</span>
          </button>
        </div>

        {/* Add Produce Form */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-4 bg-[#fbf9f5] rounded-xl border border-[#ede9df] space-y-3 text-xs">
            <div className="font-bold text-stone-800">Add Household Produce</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Item Name (e.g. Native Spinach, Potatoes)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="p-2.5 bg-white border border-stone-300 rounded-lg"
              />
              <input
                type="number"
                required
                min="50"
                step="50"
                placeholder="Quantity in Grams (e.g. 500)"
                value={quantityGrams}
                onChange={(e) => setQuantityGrams(Number(e.target.value))}
                className="p-2.5 bg-white border border-stone-300 rounded-lg"
              />
              <input
                type="number"
                required
                min="1"
                placeholder="Estimated Expiry (Days)"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="p-2.5 bg-white border border-stone-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-stone-300 rounded-lg text-stone-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#2d6a4f] text-white px-4 py-1.5 rounded-lg font-bold"
              >
                Save to Fridge
              </button>
            </div>
          </form>
        )}

        {/* Items List */}
        {activeItems.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Refrigerator className="w-12 h-12 text-stone-300 mx-auto" />
            <h4 className="font-bold text-sm text-stone-800">Your fridge inventory is empty</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Add items above, or complete an order to automatically sync purchased farm produce into your fridge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeItems.map((item) => {
              const daysLeft = getDaysLeft(item.estimatedExpiryDate);
              const isUrgent = daysLeft <= 2;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-stone-200 bg-[#fcfbf7] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline font-bold text-stone-900 text-sm">
                      <span>{item.customName}</span>
                      <span className="text-[#2d6a4f]">{formatGrams(item.quantityGrams)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span className={isUrgent ? "text-amber-700 font-bold" : "text-stone-500"}>
                        {daysLeft > 0 ? `~${daysLeft} days remaining` : "Past peak estimated window"}
                      </span>
                    </div>

                    {item.product?.storageGuide && (
                      <p className="text-[11px] text-stone-500 pt-1">
                        💡 {item.product.storageGuide.prepTip}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleMarkConsumed(item.id, item.quantityGrams)}
                      className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Used in Cooking</span>
                    </button>

                    <button
                      onClick={() => handleMarkDiscarded(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Discarded / Spoiled"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

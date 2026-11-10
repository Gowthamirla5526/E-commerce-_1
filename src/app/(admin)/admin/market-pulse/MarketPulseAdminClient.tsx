"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Scale, CheckCircle2, TrendingUp, AlertCircle, Save } from "lucide-react";

interface AdminPulseProduct {
  productId: string;
  title: string;
  category: string;
  storePricePerKgPaise: number;
  latestMandiBenchmarkPaise: number;
  reasonForChange: string;
}

export const MarketPulseAdminClient: React.FC<{
  products: AdminPulseProduct[];
}> = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<AdminPulseProduct | null>(null);
  const [benchmarkPriceRupees, setBenchmarkPriceRupees] = useState<number>(0);
  const [reasonForChange, setReasonForChange] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenEdit = (p: AdminPulseProduct) => {
    setSelectedProduct(p);
    setBenchmarkPriceRupees(p.latestMandiBenchmarkPaise / 100);
    setReasonForChange(p.reasonForChange);
    setMessage(null);
  };

  const handleSaveBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/admin/market-pulse/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          wholesaleBenchmarkPricePaisePerKg: Math.round(benchmarkPriceRupees * 100),
          reasonForChange,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update benchmark.");
      }

      setMessage(`Benchmark for ${selectedProduct.title} updated to ₹${benchmarkPriceRupees}/kg`);
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === selectedProduct.productId
            ? {
                ...p,
                latestMandiBenchmarkPaise: Math.round(benchmarkPriceRupees * 100),
                reasonForChange,
              }
            : p
        )
      );
      setSelectedProduct(null);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">
          Market Pulse & APMC Mandi Benchmark Manager
        </h1>
        <p className="text-xs text-stone-500">
          Sync daily Agmarknet government auction rates from Yeshwanthpur/Kolar Mandi and provide transparent pricing rationale.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Produce Item</th>
              <th className="py-3 px-4">Our Retail Rate</th>
              <th className="py-3 px-4">Govt Mandi Rate</th>
              <th className="py-3 px-4">Pricing Narrative / Weather Shift</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.productId} className="hover:bg-stone-50/50">
                <td className="py-3 px-4">
                  <span className="font-bold text-stone-900 block">{p.title}</span>
                  <span className="text-[10px] text-stone-400">{p.category}</span>
                </td>
                <td className="py-3 px-4 font-bold text-[#1b4332]">
                  ₹{(p.storePricePerKgPaise / 100).toFixed(0)}/kg
                </td>
                <td className="py-3 px-4 font-bold text-stone-700">
                  ₹{(p.latestMandiBenchmarkPaise / 100).toFixed(0)}/kg
                </td>
                <td className="py-3 px-4 text-stone-600 max-w-md truncate">
                  {p.reasonForChange}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium text-xs transition-colors"
                  >
                    Update Rate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Benchmark Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-stone-900">
              Update APMC Benchmark: {selectedProduct.title}
            </h3>

            <form onSubmit={handleSaveBenchmark} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mandi Wholesale Benchmark Rate (₹ / kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={benchmarkPriceRupees}
                  onChange={(e) => setBenchmarkPriceRupees(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Public Transparency Explanation
                </label>
                <textarea
                  value={reasonForChange}
                  onChange={(e) => setReasonForChange(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                  placeholder="e.g. Heavy post-monsoon arrivals from Kolar; prices stabilized."
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4332] disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Benchmark"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


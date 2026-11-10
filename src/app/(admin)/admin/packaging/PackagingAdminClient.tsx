"use client";

import React, { useState } from "react";
import { Package, QrCode, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";

interface AdminCrate {
  id: string;
  assetCode: string;
  qrCodePayload: string;
  status: string;
  totalCycleCount: number;
  packagingType: {
    name: string;
    depositPaise: number;
  };
  currentUser?: {
    name: string;
    phone: string | null;
  } | null;
  currentOrderNumber?: string | null;
  returnRequested: boolean;
}

export const PackagingAdminClient: React.FC<{
  crates: AdminCrate[];
}> = ({ crates: initialCrates }) => {
  const [crates, setCrates] = useState<AdminCrate[]>(initialCrates);
  const [selectedCrate, setSelectedCrate] = useState<AdminCrate | null>(null);
  const [condition, setCondition] = useState<"PASSED_CLEAN" | "DAMAGED">("PASSED_CLEAN");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckInCrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrate) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/admin/packaging/crates/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedCrate.id,
          condition,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to process crate check-in.");
      }

      setMessage(
        `Crate ${selectedCrate.assetCode} checked in (${condition}). Customer deposit refunded!`
      );
      setCrates((prev) =>
        prev.map((c) =>
          c.id === selectedCrate.id
            ? {
                ...c,
                status: condition === "PASSED_CLEAN" ? "IN_WAREHOUSE" : "DAMAGED_RETIRED",
                totalCycleCount: c.totalCycleCount + 1,
                currentUser: null,
                currentOrderNumber: null,
                returnRequested: false,
              }
            : c
        )
      );
      setSelectedCrate(null);
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
          Circular Packaging & QR Crate Fleet Manager
        </h1>
        <p className="text-xs text-stone-500">
          Track reusable ventilated crates, process doorstep returns, audit physical sanitization, and release customer deposits.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Crates Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Crate Asset & QR</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Lifecycle Cycles</th>
              <th className="py-3 px-4">Current Holder</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Warehouse Inward Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {crates.map((c) => (
              <tr key={c.id} className="hover:bg-stone-50/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{c.assetCode}</span>
                    <span className="text-[10px] bg-stone-100 text-stone-500 font-mono px-1.5 py-0.5 rounded">
                      QR: {c.qrCodePayload.slice(0, 14)}...
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-stone-700 font-medium">
                  {c.packagingType.name}
                </td>
                <td className="py-3 px-4 font-bold text-stone-800">
                  {c.totalCycleCount} reuses
                </td>
                <td className="py-3 px-4">
                  {c.currentUser ? (
                    <div>
                      <span className="font-bold text-stone-900 block">{c.currentUser.name}</span>
                      <span className="text-[10px] text-stone-500">
                        Ord: {c.currentOrderNumber || "Active"} • {c.currentUser.phone}
                      </span>
                    </div>
                  ) : (
                    <span className="text-stone-400 italic">In Darkstore Hub</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === "IN_WAREHOUSE"
                        ? "bg-emerald-100 text-emerald-800"
                        : c.status === "DISPATCHED_TO_CUSTOMER"
                        ? "bg-blue-100 text-blue-800"
                        : c.status === "RETURN_REQUESTED"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {c.status !== "IN_WAREHOUSE" && (
                    <button
                      onClick={() => {
                        setSelectedCrate(c);
                        setCondition("PASSED_CLEAN");
                      }}
                      className="px-3 py-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded font-bold text-xs transition-colors"
                    >
                      Receive & Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Return & Refund Inspection Modal */}
      {selectedCrate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-stone-900">
              Darkstore Return Check-in: {selectedCrate.assetCode}
            </h3>
            <p className="text-xs text-stone-600">
              Customer: <strong>{selectedCrate.currentUser?.name || "Customer"}</strong>.
              Upon check-in, the ₹50 deposit ledger entry is credited.
            </p>

            <form onSubmit={handleCheckInCrate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Physical Sanitation & Structural Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                >
                  <option value="PASSED_CLEAN">Passed Clean (Intact, sanitize & return to circulation)</option>
                  <option value="DAMAGED">Damaged / Broken (Retire crate, deposit forfeited)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrate(null)}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4332] disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Complete Check-In & Refund ₹50"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

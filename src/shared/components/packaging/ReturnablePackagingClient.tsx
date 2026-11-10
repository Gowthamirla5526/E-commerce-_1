"use client";

import React, { useState } from "react";
import {
  Package,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Leaf,
  DollarSign,
} from "lucide-react";

interface ActiveCrate {
  ledgerId: string;
  assetId: string;
  assetCode: string;
  qrCodePayload: string;
  depositAmountPaise: number;
  chargedAt: string;
  orderNumber: string;
  orderDate: string;
  crateType: string;
  returnRequested: boolean;
  returnStatus: string | null;
}

interface LedgerEntry {
  id: string;
  depositAmountPaise: number;
  status: string;
  chargedAt: string;
  refundedAt?: string | null;
  packagingAsset: {
    assetCode: string;
  };
  order: {
    orderNumber: string;
  };
}

export const ReturnablePackagingClient: React.FC<{
  initialActiveCrates: ActiveCrate[];
  totalActiveDepositPaise: number;
  initialLedger: LedgerEntry[];
}> = ({ initialActiveCrates, totalActiveDepositPaise, initialLedger }) => {
  const [activeCrates, setActiveCrates] = useState<ActiveCrate[]>(initialActiveCrates);
  const [totalDeposit, setTotalDeposit] = useState<number>(totalActiveDepositPaise);
  const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedger);
  const [loadingAssetId, setLoadingAssetId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleScheduleReturn = async (assetId: string) => {
    setLoadingAssetId(assetId);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/packaging/schedule-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packagingAssetId: assetId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to schedule return.");
      }

      setMessage({ type: "success", text: json.message });
      setActiveCrates((prev) =>
        prev.map((c) =>
          c.assetId === assetId ? { ...c, returnRequested: true, returnStatus: "REQUESTED" } : c
        )
      );
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingAssetId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2421] to-[#2d6a4f] text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <Leaf className="w-3.5 h-3.5" />
            Zero-Waste Circular Logistics
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Returnable Crates & Deposits
          </h1>
          <p className="text-stone-300 text-sm md:text-base leading-relaxed">
            Fresh Harvest eliminates all single-use plastic grocery bags. Your fresh produce arrives
            in sanitized, food-grade crates. Return them to your delivery driver anytime for an
            instant ₹50 deposit refund per crate.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-stone-300 block text-[11px]">Active Crate Deposits Held</span>
              <span className="text-xl font-black text-emerald-300 mt-0.5 block">
                ₹{(totalDeposit / 100).toFixed(2)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-stone-300 block text-[11px]">Crates in Your Possession</span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {activeCrates.length} {activeCrates.length === 1 ? "Crate" : "Crates"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Active Crates Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Crates Currently at Your Home
            </h2>
            <p className="text-xs text-stone-500">
              Hand these back to your delivery partner during your next delivery to release your ₹50 deposit.
            </p>
          </div>
        </div>

        {activeCrates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-700">No Crates Currently with You</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You do not have any active returnable crates at home. Crates are delivered with your produce orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCrates.map((crate) => (
              <div
                key={crate.assetId}
                className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-stone-900">
                          {crate.assetCode}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                          ₹{(crate.depositAmountPaise / 100).toFixed(0)} Deposit
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 block mt-0.5">
                        {crate.crateType}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-stone-50 rounded-xl border border-stone-200" title={crate.qrCodePayload}>
                    <QrCode className="w-5 h-5 text-stone-600" />
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Delivered with Order:</span>
                    <span className="font-mono font-bold text-stone-800">{crate.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered Date:</span>
                    <span>
                      {new Date(crate.orderDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {crate.returnRequested ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 w-full justify-center">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Return Scheduled: Driver Will Collect at Next Drop</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleScheduleReturn(crate.assetId)}
                      disabled={loadingAssetId === crate.assetId}
                      className="w-full py-2.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>
                        {loadingAssetId === crate.assetId
                          ? "Scheduling..."
                          : "Schedule Empty Crate Return Pickup (Get ₹50)"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Transaction Ledger */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 px-1">
          Deposit & Refund History
        </h2>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Crate Asset</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Deposit Amount</th>
                <th className="py-3 px-4">Charged On</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    {entry.packagingAsset.assetCode}
                  </td>
                  <td className="py-3 px-4 text-stone-600 font-mono">
                    {entry.order.orderNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-800">
                    ₹{(entry.depositAmountPaise / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {new Date(entry.chargedAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.status === "REFUNDED_TO_CREDIT" || entry.status === "REFUNDED_TO_SOURCE"
                          ? "bg-emerald-100 text-emerald-800"
                          : entry.status === "CHARGED"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


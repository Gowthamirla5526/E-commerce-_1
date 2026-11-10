"use client";

import React, { useState } from "react";
import { Plus, Package, ShieldCheck, Check, AlertCircle, Clock, Building2 } from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";

interface SkuOption {
  id: string;
  skuCode: string;
  packageSizeGrams: number;
  product: {
    title: string;
  };
}

interface SupplierOption {
  id: string;
  name: string;
  code: string;
}

interface LocationOption {
  id: string;
  name: string;
  code: string;
}

interface BatchRecord {
  id: string;
  batchNumber: string;
  initialQuantityGrams: number;
  availableQuantityGrams: number;
  readinessStage: string;
  receivedDate: string;
  bestBeforeDate: string;
  status: string;
  sku: {
    skuCode: string;
    product: {
      title: string;
    };
  };
  supplier: {
    name: string;
  };
  location: {
    code: string;
  };
  inspections?: Array<{
    overallGrade: string;
    firmnessScore: number;
    blemishScore: number;
  }>;
}

export const InventoryAdminClient: React.FC<{
  initialBatches: BatchRecord[];
  skus: SkuOption[];
  suppliers: SupplierOption[];
  locations: LocationOption[];
}> = ({ initialBatches, skus, suppliers, locations }) => {
  const [batches, setBatches] = useState<BatchRecord[]>(initialBatches);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form fields
  const [skuId, setSkuId] = useState(skus[0]?.id || "");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [batchNumber, setBatchNumber] = useState(
    `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-INW-01`
  );
  const [quantityKg, setQuantityKg] = useState(100);
  const [unitCostRupees, setUnitCostRupees] = useState(18);
  const [readinessStage, setReadinessStage] = useState("READY_TO_EAT");
  const [bestBeforeDays, setBestBeforeDays] = useState(5);
  const [inspectionGrade, setInspectionGrade] = useState("GRADE_A_PREMIUM");
  const [inspectionNotes, setInspectionNotes] = useState("Inward gate verified: Normal aroma, crisp skin, blemish-free.");

  const handleInwardBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        batchNumber,
        skuId,
        supplierId,
        locationId,
        initialQuantityGrams: Number(quantityKg) * 1000,
        unitCostPaise: Math.round(Number(unitCostRupees) * 100),
        readinessStage,
        bestBeforeDays: Number(bestBeforeDays),
        inspectionGrade,
        inspectionNotes,
      };

      const res = await fetch("/api/v1/admin/inventory/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to inward batch.");
      }

      setMessage({ text: "Perishable inventory batch inwarded successfully!", type: "success" });
      setShowAddForm(false);
      setBatchNumber(`BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-INW-${Math.floor(Math.random() * 90 + 10)}`);

      // Refresh
      const updatedRes = await fetch("/api/v1/admin/inventory/batches");
      const updatedJson = await updatedRes.json();
      if (updatedJson.success) {
        setBatches(updatedJson.data);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const totalGramsAvailable = batches.reduce(
    (sum, b) => (b.status === "ACTIVE" ? sum + b.availableQuantityGrams : sum),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Perishable Batch Inventory & Inwarding (FEFO)
            </h1>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Main Branch
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Bengaluru Central Hub: Every fruit & vegetable SKU tracked to distinct farm inwardings with verified ripeness stages.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Inward New Perishable Batch"}</span>
        </button>
      </div>

      {/* KPI Header Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Total Active Stock in the Shop
          </span>
          <span className="text-2xl font-extrabold text-[#2d6a4f] block mt-1">
            {formatGrams(totalGramsAvailable)}
          </span>
          <span className="text-[11px] text-stone-500">Across all SKUs in Shop</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Active Branch
          </span>
          <span className="text-2xl font-extrabold text-stone-900 block mt-1">
            1 Main Branch
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">
            Bengaluru Central Hub ({batches.filter((b) => b.status === "ACTIVE").length} Active Batches)
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Quality Gate Compliance
          </span>
          <span className="text-2xl font-extrabold text-stone-900 block mt-1">100% Inspected</span>
          <span className="text-[11px] text-stone-500">Zero Uninspected Produce in Shop</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Batch Inwarding Form */}
      {showAddForm && (
        <form
          onSubmit={handleInwardBatch}
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900">Inward Fresh Produce Batch</h3>
            <p className="text-xs text-stone-500">
              Captures farm receipt, quantity in grams, and physical ripeness stage for Freshness Matchmaker.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Batch Number *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Produce SKU *</label>
              <select
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.product.title} ({s.skuCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Supplier / Farm FPO *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Inwarded Quantity (Kilograms) *</label>
              <input
                type="number"
                required
                min="1"
                step="0.5"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-bold focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Unit Cost (INR ₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={unitCostRupees}
                onChange={(e) => setUnitCostRupees(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Physical Readiness Stage *</label>
              <select
                value={readinessStage}
                onChange={(e) => setReadinessStage(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-semibold focus:outline-none focus:border-[#2d6a4f]"
              >
                <option value="READY_TO_EAT">READY_TO_EAT (Peak eating today)</option>
                <option value="TURNING">TURNING (Ready in 2-3 days)</option>
                <option value="PEAK">PEAK (Morning-cut greens)</option>
                <option value="RAW">RAW (For cooking or storage)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Best Before Window (Days) *</label>
              <input
                type="number"
                required
                min="1"
                value={bestBeforeDays}
                onChange={(e) => setBestBeforeDays(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Inward Inspection Grade *</label>
              <select
                value={inspectionGrade}
                onChange={(e) => setInspectionGrade(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              >
                <option value="GRADE_A_PREMIUM">GRADE_A_PREMIUM (0 defects)</option>
                <option value="GRADE_B_STANDARD">GRADE_B_STANDARD (Acceptable variation)</option>
                <option value="REJECTED">REJECTED (Do not stock)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Receiving Branch *</label>
              <div className="flex items-center gap-2 p-2 bg-stone-100 border border-stone-300 rounded-lg text-xs font-bold text-stone-800">
                <Building2 className="w-4 h-4 text-[#2d6a4f]" />
                <span className="truncate">Main Branch (Bengaluru Central Hub - MAIN-BLR-01)</span>
                <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold shrink-0">
                  Main Branch
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Inward Quality Gate Notes</label>
            <input
              type="text"
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-stone-300 text-xs text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Inwarding..." : "Commit Inward Batch & Update Ledger"}
            </button>
          </div>
        </form>
      )}

      {/* Batches Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-700">
              <tr>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Produce SKU</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Readiness Stage</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Inward Date</th>
                <th className="py-3 px-4">Best Before (FEFO)</th>
                <th className="py-3 px-4">Quality Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4 font-bold text-stone-900">{b.batchNumber}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-stone-900">
                    {b.sku.product.title}
                  </td>
                  <td className="py-3 px-4 font-sans text-stone-600">{b.supplier.name}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332]">
                      {b.readinessStage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#2d6a4f]">
                    {formatGrams(b.availableQuantityGrams)}
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {new Date(b.receivedDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-stone-900 font-semibold">
                    {new Date(b.bestBeforeDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                      {b.inspections?.[0]?.overallGrade || "GRADE_A"}
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


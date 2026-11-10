"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  Truck,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";

interface FulfillmentTaskProps {
  pickingTasks: Array<{
    id: string;
    orderId: string;
    status: string;
    order: {
      orderNumber: string;
      createdAt: string;
      deliverySlot: {
        name: string;
        startTime: string;
      };
      items: Array<{
        id: string;
        productNameSnapshot: string;
        packageSizeSnapshotGrams: number;
        quantity: number;
        allocatedBatch: {
          batchNumber: string;
          readinessStage: string;
        } | null;
        perfectPickSnapshotJson: string | null;
      }>;
    };
  }>;
  packingOrders: Array<{
    id: string;
    orderNumber: string;
    deliverySlot: {
      name: string;
    };
    items: Array<{
      productNameSnapshot: string;
      quantity: number;
    }>;
  }>;
  availableAssets: Array<{
    id: string;
    assetCode: string;
    packagingType: {
      name: string;
    };
  }>;
}

export const FulfillmentAdminClient: React.FC<FulfillmentTaskProps> = ({
  pickingTasks: initialPicking,
  packingOrders: initialPacking,
  availableAssets,
}) => {
  const [activeTab, setActiveTab] = useState<"PICKING" | "PACKING">("PICKING");
  const [pickingTasks, setPickingTasks] = useState(initialPicking);
  const [packingOrders, setPackingOrders] = useState(initialPacking);
  const [crateInputs, setCrateInputs] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const handleCompletePicking = async (taskId: string) => {
    setLoadingTaskId(taskId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/v1/admin/fulfillment/picking/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, notes: "All batch items verified and gathered." }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to mark picking completed.");
      }

      setActionMessage({ text: "Picking verified! Order advanced to Packing queue.", type: "success" });
      setPickingTasks((prev) => prev.filter((t) => t.id !== taskId));

      // Refresh tasks
      const ref = await fetch("/api/v1/admin/fulfillment/tasks");
      const refJson = await ref.json();
      if (refJson.success) {
        setPickingTasks(refJson.data.pickingTasks);
        setPackingOrders(refJson.data.ordersReadyForPacking);
      }
    } catch (err: any) {
      setActionMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleCompletePacking = async (orderId: string) => {
    const assetCode = crateInputs[orderId] || availableAssets[0]?.assetCode;

    if (!assetCode) {
      setActionMessage({ text: "Please select or scan a circular crate QR code.", type: "error" });
      return;
    }

    setLoadingTaskId(orderId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/v1/admin/fulfillment/packing/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, packagingAssetCode: assetCode }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to pack order.");
      }

      setActionMessage({ text: `Order packed in crate ${assetCode} and staged for dispatch!`, type: "success" });
      setPackingOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      setActionMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Warehouse Picking & Packing Operations
            </h1>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Main Branch
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Bengaluru Central Hub queue: itemized batch retrieval, customer physical preferences, and circular crate scanning.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-200 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("PICKING")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "PICKING"
                ? "bg-white text-[#1c2421] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Picking Queue ({pickingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("PACKING")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "PACKING"
                ? "bg-white text-[#1c2421] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Packing & Crating ({packingOrders.length})
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Picking Tab Content */}
      {activeTab === "PICKING" && (
        <div className="space-y-4">
          {pickingTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-stone-900">All picking tasks cleared!</h3>
              <p className="text-xs text-stone-500">
                No active orders currently pending batch retrieval.
              </p>
            </div>
          ) : (
            pickingTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm block">
                      Order: {task.order.orderNumber}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" /> Slot: {task.order.deliverySlot.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCompletePicking(task.id)}
                    disabled={loadingTaskId === task.id}
                    className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loadingTaskId === task.id ? "Processing..." : "Complete Picking"}</span>
                  </button>
                </div>

                {/* Items to Pick */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Produce Items & Allocated Batches
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          <span>{item.productNameSnapshot}</span>
                          <span className="text-[#2d6a4f]">
                            {item.quantity} x {formatGrams(item.packageSizeSnapshotGrams)}
                          </span>
                        </div>

                        {item.allocatedBatch && (
                          <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600">
                            <span className="bg-stone-200 px-1.5 py-0.2 rounded">
                              Batch: {item.allocatedBatch.batchNumber}
                            </span>
                            <span className="bg-[#d8f3dc] text-[#1b4332] px-1.5 py-0.2 rounded font-sans font-semibold">
                              {item.allocatedBatch.readinessStage}
                            </span>
                          </div>
                        )}

                        {/* Customer Physical Pick Preference if configured */}
                        {item.perfectPickSnapshotJson && (
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                            ✨ <strong>Customer Pick Preference:</strong> {item.perfectPickSnapshotJson}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Packing Tab Content */}
      {activeTab === "PACKING" && (
        <div className="space-y-4">
          {packingOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-2">
              <Package className="w-12 h-12 text-[#2d6a4f] mx-auto" />
              <h3 className="font-bold text-base text-stone-900">Packing Queue Empty</h3>
              <p className="text-xs text-stone-500">
                Complete picking on orders above to move them into circular crate packing.
              </p>
            </div>
          ) : (
            packingOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm block">
                      Order: {ord.orderNumber}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Slot: {ord.deliverySlot.name} • {ord.items.length} produce packs
                    </span>
                  </div>

                  {/* Circular Crate QR Assignment */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <QrCode className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={crateInputs[ord.id] || availableAssets[0]?.assetCode || ""}
                        onChange={(e) =>
                          setCrateInputs({ ...crateInputs, [ord.id]: e.target.value })
                        }
                        className="bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                      >
                        {availableAssets.map((asset) => (
                          <option key={asset.id} value={asset.assetCode}>
                            {asset.assetCode} ({asset.packagingType.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleCompletePacking(ord.id)}
                      disabled={loadingTaskId === ord.id}
                      className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Package className="w-4 h-4" />
                      <span>{loadingTaskId === ord.id ? "Securing..." : "Seal & Pack"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <span className="font-semibold text-stone-700">Included items:</span>
                  <p className="text-stone-500">
                    {ord.items.map((i) => `${i.quantity}x ${i.productNameSnapshot}`).join(", ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};


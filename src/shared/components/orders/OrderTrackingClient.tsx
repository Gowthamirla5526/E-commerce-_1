"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Banknote,
  RotateCcw,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";
import { useCart } from "@/shared/context/CartContext";

export interface OrderDetailProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotalPaise: number;
    packagingDepositPaise: number;
    deliveryFeePaise: number;
    totalPaise: number;
    deliveryDate: string;
    cancellationReason: string | null;
    createdAt: string;
    addressSnapshot: {
      recipientName: string;
      phone: string;
      streetLine1: string;
      locality: string;
      city: string;
      state: string;
      pincode: string;
    };
    deliverySlot: {
      name: string;
      startTime: string;
      endTime: string;
    };
    items: Array<{
      id: string;
      skuId: string;
      productNameSnapshot: string;
      packageSizeSnapshotGrams: number;
      unitPricePaise: number;
      quantity: number;
      totalPricePaise: number;
      allocatedBatchNumber: string | null;
      readinessStage: string | null;
    }>;
    packingTask?: {
      packagingAssetCodes: string[];
    } | null;
  };
}

export const OrderTrackingClient: React.FC<OrderDetailProps> = ({ order: initialOrder }) => {
  const [order, setOrder] = useState(initialOrder);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const { addItem } = useCart();

  const steps = [
    { key: "CONFIRMED", label: "Order Confirmed" },
    { key: "PICKING", label: "Batch Picking" },
    { key: "PACKING", label: "Crate Packing" },
    { key: "PACKED", label: "Packed & Staged" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered & Inspected" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "ACCEPTED":
        return 0;
      case "PICKING":
        return 1;
      case "PACKING":
        return 2;
      case "PACKED":
        return 3;
      case "OUT_FOR_DELIVERY":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order.status);
  const canCancel = ["CONFIRMED", "ACCEPTED", "PICKING", "PACKING", "PACKED"].includes(order.status);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this fresh produce order? All reserved farm batches will be returned to inventory.")) {
      return;
    }

    setIsCancelling(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Customer requested cancellation." }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to cancel order.");
      }

      setOrder({ ...order, status: "CANCELLED", cancellationReason: "Customer requested cancellation." });
      setMessage({ text: "Order successfully cancelled and farm batches restored.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      addItem({
        skuId: item.skuId,
        productId: "",
        title: item.productNameSnapshot,
        slug: "",
        imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
        sellingPricePaise: item.unitPricePaise,
        mrpPaise: item.unitPricePaise,
        packageSizeGrams: item.packageSizeSnapshotGrams,
        unitType: "GRAMS",
      }, item.quantity);
    });
    setMessage({ text: "Items added to your basket!", type: "success" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href="/account/orders" className="hover:text-[#2d6a4f] transition-colors">My Orders</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-mono text-stone-900 font-bold">{order.orderNumber}</span>
      </nav>

      {/* Main Order Header */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-[#1c2421]">{order.orderNumber}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              order.status === "DELIVERED"
                ? "bg-emerald-100 text-emerald-800"
                : order.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-[#d8f3dc] text-[#1b4332]"
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}

          <button
            onClick={handleReorder}
            className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Progress Stepper */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#1c2421]">Live Fulfilment Journey</h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {steps.map((st, idx) => {
              const isPast = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={st.key} className="space-y-1.5 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? "bg-[#2d6a4f] text-white ring-4 ring-[#d8f3dc]"
                      : isPast
                      ? "bg-[#52b788] text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}>
                    {isPast ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[11px] font-semibold leading-tight ${
                    isCurrent ? "text-[#2d6a4f]" : isPast ? "text-stone-800" : "text-stone-400"
                  }`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery Slot, Crate & Payment Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Delivery Slot */}
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#2d6a4f] font-bold">
            <Clock className="w-4 h-4" />
            <span>Delivery Slot</span>
          </div>
          <div className="font-bold text-stone-900 text-sm">{order.deliverySlot.name}</div>
          <p className="text-stone-500">
            Window: {order.deliverySlot.startTime} - {order.deliverySlot.endTime}
          </p>
          <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-100 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#2d6a4f]" />
            <span>{order.addressSnapshot.recipientName}, {order.addressSnapshot.locality}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#2d6a4f] font-bold">
            <Banknote className="w-4 h-4" />
            <span>Payment Method</span>
          </div>
          <div className="font-bold text-stone-900 text-sm">Cash on Delivery</div>
          <p className="text-stone-500">
            Pay {formatPaise(order.totalPaise)} via Cash or UPI at your doorstep.
          </p>
          <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            Status: {order.paymentStatus === "PAID" ? "Settled" : "Payable on Doorstep"}
          </div>
        </div>

        {/* Circular Crate Tracking */}
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#2d6a4f] font-bold">
            <Package className="w-4 h-4" />
            <span>Returnable Packaging</span>
          </div>
          <div className="font-bold text-stone-900 text-sm">
            {order.packingTask?.packagingAssetCodes?.[0] ? `Crate: ${order.packingTask.packagingAssetCodes[0]}` : "Assigned on Packing"}
          </div>
          <p className="text-stone-500">
            Deposit: ₹100 (Credited back on crate return).
          </p>
          <div className="text-[11px] text-[#2d6a4f] pt-1 border-t border-stone-100">
            100% Circular, Sanitised Crates
          </div>
        </div>
      </div>

      {/* Items Table & Final Price Breakdown */}
      <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#1c2421]">Produce Items & Inward Batches</h3>

        <div className="divide-y divide-stone-100 text-xs">
          {order.items.map((it) => (
            <div key={it.id} className="py-3 first:pt-0 flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-900 block">{it.productNameSnapshot}</span>
                <span className="text-stone-500 text-[11px]">
                  {it.quantity} x {formatGrams(it.packageSizeSnapshotGrams)} • {formatPaise(it.unitPricePaise)} / pack
                </span>
                {it.allocatedBatchNumber && (
                  <span className="inline-block mt-0.5 text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                    Allocated Batch: {it.allocatedBatchNumber} ({it.readinessStage})
                  </span>
                )}
              </div>
              <span className="font-bold text-stone-900">{formatPaise(it.totalPricePaise)}</span>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Produce Subtotal</span>
            <span className="font-bold text-stone-900">{formatPaise(order.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Morning Delivery</span>
            <span className={`font-bold ${order.deliveryFeePaise === 0 ? "text-[#2d6a4f]" : "text-stone-900"}`}>
              {order.deliveryFeePaise === 0 ? "FREE" : formatPaise(order.deliveryFeePaise)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Returnable Crate Deposit</span>
            <span className="font-bold text-stone-900">{formatPaise(order.packagingDepositPaise)}</span>
          </div>
          <div className="border-t border-stone-100 pt-2 flex justify-between items-baseline text-sm font-extrabold text-[#1c2421]">
            <span>Total Payable at Doorstep</span>
            <span className="text-lg text-[#2d6a4f]">{formatPaise(order.totalPaise)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


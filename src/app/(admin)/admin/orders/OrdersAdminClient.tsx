"use client";

import React, { useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, XCircle, ChevronDown, Package } from "lucide-react";

interface AdminOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  paymentStatus: string;
  totalPaise: number;
  itemCount: number;
  slotName: string;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    unitPricePaise: number;
  }[];
}

export const OrdersAdminClient: React.FC<{
  initialOrders: AdminOrderItem[];
}> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<AdminOrderItem[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredOrders =
    selectedStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update order status.");
      }

      setMessage(json.message);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                paymentStatus: newStatus === "DELIVERED" ? "PAID" : o.paymentStatus,
              }
            : o
        )
      );
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800";
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800";
      case "PACKED":
      case "PICKING":
        return "bg-amber-100 text-amber-800";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-stone-100 text-stone-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Customer Orders Management
            </h1>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Main Branch
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Bengaluru Central Hub: Monitor incoming Cash on Delivery orders, manage fulfillment stages, and update delivery statuses.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
          >
            <option value="ALL">All Orders ({orders.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PICKING">Picking</option>
            <option value="PACKED">Packed</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items / Total</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-stone-900 block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-stone-800 block">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {order.customerPhone || "Phone N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#1b4332] block">
                      ₹{(order.totalPaise / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {order.itemCount} produce {order.itemCount === 1 ? "item" : "items"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {order.slotName}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus === "PAID" ? "Cash/UPI Paid" : "Pay at Doorstep"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#2d6a4f] cursor-pointer"
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PICKING">PICKING</option>
                      <option value="PACKED">PACKED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
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


"use client";

import React, { useState } from "react";
import {
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  PlusCircle,
  Truck,
  AlertCircle,
} from "lucide-react";

interface AdminCampaign {
  id: string;
  title: string;
  slug: string;
  farmName: string;
  location: string;
  harvestDate: string;
  targetGrams: number;
  currentGrams: number;
  unitPricePaise: number;
  benchmarkRetailPricePaise: number;
  deadlineAt: string;
  status: string;
  participantCount: number;
  percentage: number;
}

export const HarvestDropsAdminClient: React.FC<{
  initialCampaigns: AdminCampaign[];
}> = ({ initialCampaigns }) => {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<AdminCampaign | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>("CONFIRMED");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/harvest/campaigns/${selectedCampaign.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusUpdate }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status.");
      }

      setMessage(`Campaign updated to ${statusUpdate}`);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === selectedCampaign.id ? { ...c, status: statusUpdate } : c))
      );
      setSelectedCampaign(null);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-stone-900">
            Community Harvest Drops Manager
          </h1>
          <p className="text-xs text-stone-500">
            Monitor neighborhood campaign pooling, lock supplier harvest commitments, and dispatch bulk produce.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Campaign & Farm</th>
                <th className="py-3 px-4">Pledged Progress</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">Households</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {campaigns.map((c) => {
                const targetKg = (c.targetGrams / 1000).toFixed(0);
                const currentKg = (c.currentGrams / 1000).toFixed(0);

                return (
                  <tr key={c.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{c.title}</div>
                      <div className="text-[11px] text-stone-500">
                        {c.farmName} ({c.location})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-800">
                        {currentKg} / {targetKg} kg ({c.percentage}%)
                      </div>
                      <div className="w-28 bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${
                            c.percentage >= 100
                              ? "bg-emerald-500"
                              : c.percentage >= 70
                              ? "bg-amber-500"
                              : "bg-[#2d6a4f]"
                          }`}
                          style={{ width: `${Math.min(100, c.percentage)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900">
                        ₹{(c.unitPricePaise / 100).toFixed(0)}/kg
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Retail: ₹{(c.benchmarkRetailPricePaise / 100).toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-medium">
                        <Users className="w-3 h-3 text-stone-400" />
                        {c.participantCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {new Date(c.deadlineAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === "TARGET_REACHED" || c.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "NEAR_TARGET"
                            ? "bg-amber-100 text-amber-800"
                            : c.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCampaign(c);
                          setStatusUpdate(c.status);
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded transition-colors text-xs"
                      >
                        Manage Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Status Transition */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-stone-900">
              Update Harvest Campaign Lifecycle
            </h3>
            <p className="text-xs text-stone-600">
              Transitioning <strong>{selectedCampaign.title}</strong>
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Status
                </label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
                >
                  <option value="OPEN">OPEN (Accepting Pledges)</option>
                  <option value="NEAR_TARGET">NEAR_TARGET (70%+ Threshold)</option>
                  <option value="TARGET_REACHED">TARGET_REACHED (Locked Goal)</option>
                  <option value="CONFIRMED">CONFIRMED (Farmer Dispatched)</option>
                  <option value="FULFILLMENT">FULFILLMENT (Sorting & Packing)</option>
                  <option value="DELIVERED">DELIVERED (Complete)</option>
                  <option value="CANCELLED">CANCELLED (Pledges Released)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4332] disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


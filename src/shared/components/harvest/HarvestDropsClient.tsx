"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Package,
} from "lucide-react";

interface CampaignItem {
  id: string;
  title: string;
  slug: string;
  farmName: string;
  location: string;
  harvestDate: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  targetGrams: number;
  currentGrams: number;
  unitPricePaise: number;
  benchmarkRetailPricePaise: number;
  deadlineAt: string;
  imageUrl: string;
  description: string;
  status: string;
  percentage: number;
  isExpired: boolean;
  savingsPaise: number;
  savingsPercentage: number;
  participantCount: number;
}

export const HarvestDropsClient: React.FC<{
  initialCampaigns: CampaignItem[];
}> = ({ initialCampaigns }) => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [pledgeKg, setPledgeKg] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleOpenPledge = (c: CampaignItem) => {
    setSelectedCampaign(c);
    setPledgeKg(5);
    setFeedbackMessage(null);
  };

  const handleJoinCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/v1/harvest/campaigns/${selectedCampaign.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantityGrams: pledgeKg * 1000,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to join campaign.");
      }

      setFeedbackMessage({ type: "success", text: json.message });

      // Refresh campaigns
      const refreshRes = await fetch("/api/v1/harvest/campaigns");
      const refreshJson = await refreshRes.json();
      if (refreshJson.success) {
        setCampaigns(refreshJson.data);
      }
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string, percentage: number) => {
    if (status === "TARGET_REACHED" || percentage >= 100) {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Target Reached • Confirmed
        </span>
      );
    }
    if (status === "NEAR_TARGET" || percentage >= 70) {
      return (
        <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          Near Target ({percentage}%)
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
        <Users className="w-3.5 h-3.5 text-blue-600" />
        Open Pool ({percentage}%)
      </span>
    );
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#40916c] text-white p-8 md:p-12 shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Direct-From-Farm Community Pooling
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Community Harvest Drops
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            Team up with your Bengaluru neighbourhood to unlock farm-gate wholesale prices.
            We harvest only when the community pool hits the target—ensuring zero food waste and unbeatable morning freshness.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Pay on Delivery (Cash or UPI)
            </span>
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-300" />
              Circular Crate Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              Up to 35% Bulk Savings
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((c) => {
          const targetKg = (c.targetGrams / 1000).toFixed(0);
          const currentKg = (c.currentGrams / 1000).toFixed(0);
          const unitPriceRupees = (c.unitPricePaise / 100).toFixed(0);
          const benchmarkRetailRupees = (c.benchmarkRetailPricePaise / 100).toFixed(0);
          const deadlineDate = new Date(c.deadlineAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 w-full bg-stone-100">
                <Image
                  src={c.imageUrl}
                  alt={c.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(c.status, c.percentage)}
                </div>
                {c.savingsPercentage > 0 && (
                  <div className="absolute bottom-3 left-3 bg-[#1b4332]/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    Save {c.savingsPercentage}% vs Mandi/Retail
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>{c.farmName} • {c.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">
                      {currentKg} kg <span className="font-normal text-stone-400">/ {targetKg} kg pledged</span>
                    </span>
                    <span className="font-bold text-[#2d6a4f]">{c.percentage}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        c.percentage >= 100
                          ? "bg-emerald-500"
                          : c.percentage >= 70
                          ? "bg-amber-500"
                          : "bg-[#2d6a4f]"
                      }`}
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-400" />
                      {c.participantCount} households joined
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      Closes {deadlineDate}
                    </span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#1b4332]">
                        ₹{unitPriceRupees}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">/ kg</span>
                      <span className="text-xs text-stone-400 line-through">
                        ₹{benchmarkRetailRupees}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      Pay Cash/UPI on Delivery
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenPledge(c)}
                    className="px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span>Pledge Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pledge Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider block">
                  Neighbourhood Harvest Drop
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1">
                  {selectedCampaign.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Direct from {selectedCampaign.farmName} ({selectedCampaign.location})
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {feedbackMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold ${
                  feedbackMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {feedbackMessage.text}
              </div>
            )}

            <form onSubmit={handleJoinCampaign} className="space-y-6">
              {/* Quantity selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-3">
                  Select Pledged Quantity (kg)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[2, 5, 10, 15].map((kg) => (
                    <button
                      key={kg}
                      type="button"
                      onClick={() => setPledgeKg(kg)}
                      className={`py-3 rounded-xl border text-center transition-all ${
                        pledgeKg === kg
                          ? "border-[#2d6a4f] bg-[#d8f3dc] text-[#1b4332] font-black shadow-sm"
                          : "border-stone-200 bg-stone-50 text-stone-700 font-semibold hover:border-stone-300"
                      }`}
                    >
                      <div className="text-base">{kg} kg</div>
                      <div className="text-[10px] text-stone-500">
                        ₹{((selectedCampaign.unitPricePaise * kg) / 100).toFixed(0)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Unit Price:</span>
                  <span>₹{(selectedCampaign.unitPricePaise / 100).toFixed(2)} / kg</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Pledged Volume:</span>
                  <span className="font-semibold text-stone-800">{pledgeKg} kg</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Retail Equivalent:</span>
                  <span className="line-through text-stone-400">
                    ₹{((selectedCampaign.benchmarkRetailPricePaise * pledgeKg) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-sm">
                  <span>Total Amount (Pay on Delivery):</span>
                  <span className="text-[#1b4332] text-base font-black">
                    ₹{((selectedCampaign.unitPricePaise * pledgeKg) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-[#d8f3dc]/50 p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#1b4332]">
                <ShieldCheck className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                <p>
                  <strong>No upfront payment:</strong> Your card is NOT charged. When the campaign locks,
                  the farmer harvests your crate and you pay cash or UPI at your doorstep upon arrival.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="flex-1 py-3 px-4 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Locking Pledge..." : "Confirm Pledge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


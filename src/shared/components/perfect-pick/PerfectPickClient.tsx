"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Check, ChevronRight, ShieldCheck, Heart } from "lucide-react";

interface ProductPickOption {
  productId: string;
  title: string;
  featuredImageUrl: string;
  categoryName: string;
  currentPreference?: {
    preferredFirmness: string;
    preferredRipeness: string;
    preferredSize: string;
    specialInstructions?: string | null;
  } | null;
}

export const PerfectPickClient: React.FC<{ initialProducts: ProductPickOption[] }> = ({
  initialProducts,
}) => {
  const [preferences, setPreferences] = useState<Record<string, {
    firmness: string;
    ripeness: string;
    size: string;
    instructions: string;
    saved: boolean;
  }>>(() => {
    const map: any = {};
    initialProducts.forEach((p) => {
      map[p.productId] = {
        firmness: p.currentPreference?.preferredFirmness || "ANY",
        ripeness: p.currentPreference?.preferredRipeness || "ANY",
        size: p.currentPreference?.preferredSize || "ANY",
        instructions: p.currentPreference?.specialInstructions || "",
        saved: false,
      };
    });
    return map;
  });

  const handleUpdate = (productId: string, field: string, val: string) => {
    setPreferences((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: val,
        saved: false,
      },
    }));
  };

  const handleSave = async (productId: string) => {
    const pref = preferences[productId];
    if (!pref) return;

    try {
      const res = await fetch("/api/v1/perfect-pick/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          preferredFirmness: pref.firmness,
          preferredRipeness: pref.ripeness,
          preferredSize: pref.size,
          specialInstructions: pref.instructions || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPreferences((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            saved: true,
          },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">My Perfect Pick</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8f3dc] text-[#1b4332] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#2d6a4f]" />
          <span>Signature Feature 04</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          My Perfect Pick
        </h1>
        <p className="text-xs sm:text-sm text-[#d8f3dc]/90 max-w-2xl leading-relaxed">
          Take control over physical produce traits. Save your firmness, ripeness, and size preferences for everyday staples. Our picking staff receives your standardized instructions on their warehouse tablets.
        </p>
      </div>

      <div className="p-4 bg-[#fbf9f5] border border-[#ede9df] rounded-2xl flex items-center gap-3 text-xs text-stone-700">
        <ShieldCheck className="w-5 h-5 text-[#2d6a4f] shrink-0" />
        <span>
          <strong>Operational Assurance:</strong> Preferences are automatically dispatched into our darkstore picking queues (`PickingTask`). If an exact specification cannot be fulfilled, staff report the fallback directly.
        </span>
      </div>

      {/* Preferences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialProducts.map((p) => {
          const pref = preferences[p.productId] || {
            firmness: "ANY",
            ripeness: "ANY",
            size: "ANY",
            instructions: "",
            saved: false,
          };

          return (
            <div
              key={p.productId}
              className="bg-white rounded-2xl border border-[#e8e3d9] p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="relative w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                  <Image
                    src={p.featuredImageUrl}
                    alt={p.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider block">
                    {p.categoryName}
                  </span>
                  <h3 className="font-bold text-sm text-[#1c2421]">{p.title}</h3>
                </div>
              </div>

              {/* Firmness Preference */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-stone-700 block">Preferred Firmness:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {["CRISP", "MEDIUM", "SOFT", "ANY"].map((f) => (
                    <button
                      key={f}
                      onClick={() => handleUpdate(p.productId, "firmness", f)}
                      className={`p-2 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                        pref.firmness === f
                          ? "bg-[#2d6a4f] text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ripeness Preference */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-stone-700 block">Preferred Ripeness:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "READY_TO_EAT", label: "Ready to Eat Today" },
                    { id: "TURNING", label: "Turning (Ripens in 2d)" },
                    { id: "RAW_FOR_COOKING", label: "Raw for Cooking / Storage" },
                    { id: "ANY", label: "Any Available" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleUpdate(p.productId, "ripeness", r.id)}
                      className={`p-2 rounded-lg font-semibold text-[11px] text-left transition-all cursor-pointer ${
                        pref.ripeness === r.id
                          ? "bg-[#2d6a4f] text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Preference */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-stone-700 block">Preferred Size:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {["SMALL", "MEDIUM", "LARGE", "ANY"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdate(p.productId, "size", s)}
                      className={`p-2 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                        pref.size === s
                          ? "bg-[#2d6a4f] text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions Note */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-stone-700 block">Special Picking Notes:</span>
                <input
                  type="text"
                  placeholder="e.g. Choose slightly green skin for morning smoothies"
                  value={pref.instructions}
                  onChange={(e) => handleUpdate(p.productId, "instructions", e.target.value)}
                  className="w-full p-2 bg-[#fbf9f5] border border-stone-200 rounded-lg text-xs"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave(p.productId)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    pref.saved
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-[#2d6a4f] hover:bg-[#1b4332] text-white shadow-sm"
                  }`}
                >
                  {pref.saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saved for Picking</span>
                    </>
                  ) : (
                    <span>Save My Picking Preference</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


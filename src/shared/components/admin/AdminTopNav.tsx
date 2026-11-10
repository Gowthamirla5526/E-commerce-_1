"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCcw,
  MessageSquare,
  Crosshair,
  Moon,
  LogOut,
  Building2,
} from "lucide-react";

interface AdminTopNavProps {
  adminName: string;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({ adminName }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [showMessageAlert, setShowMessageAlert] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/orders?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/admin-logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200/80 px-6 sm:px-8 flex items-center justify-between gap-4">
      {/* Search Input Bar with Inner Green Search Pill (Reference Aesthetic) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search Something..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-stone-200 rounded-full pl-10 pr-24 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 bg-[#00c853] hover:bg-[#00b248] text-white text-[11px] font-bold px-3.5 py-1 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      {/* Main Branch Single-Branch Context Pill */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-[#f8fafc] border border-stone-200/90 rounded-full text-xs font-bold text-stone-700 shadow-2xs">
        <Building2 className="w-3.5 h-3.5 text-[#00c853]" />
        <span>Main Branch</span>
        <span className="text-stone-300 font-normal">|</span>
        <span className="text-stone-500 font-medium text-[11px]">Bengaluru Central Hub</span>
        <span className="ml-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
          Single Branch
        </span>
      </div>

      {/* Right Action Icons (Reference Screenshot) */}
      <div className="flex items-center gap-2.5">
        {/* Sync/Refresh */}
        <button
          onClick={() => router.refresh()}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Message */}
        <div className="relative">
          <button
            onClick={() => setShowMessageAlert(!showMessageAlert)}
            className="relative w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Operational Alerts"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>
          {showMessageAlert && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-xl shadow-lg border border-stone-200 p-3 text-xs z-50 animate-fadeIn space-y-1">
              <span className="font-bold text-stone-900 block">Main Branch Hub Alerts (3)</span>
              <p className="text-stone-600 text-[11px]">
                • 12 Morning Delivery crates dispatched on time.<br />
                • Inwarding verified: Kolar Tomatoes batch Grade A.<br />
                • Reusable crates balance: 140 crates active.
              </p>
            </div>
          )}
        </div>

        {/* Target/Focus */}
        <button
          onClick={() => {
            setFocusMode(!focusMode);
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen?.().catch(() => {});
            } else {
              document.exitFullscreen?.().catch(() => {});
            }
          }}
          className={`w-9 h-9 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            focusMode ? "bg-[#00c853] text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
          }`}
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Fullscreen Mode"}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Theme Moon */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`w-9 h-9 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            isDark ? "bg-stone-800 text-amber-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Status indicator pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse"></span>
          <span>Online</span>
        </div>

        {/* Quick Sign Out Button */}
        <button
          onClick={handleLogout}
          className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};


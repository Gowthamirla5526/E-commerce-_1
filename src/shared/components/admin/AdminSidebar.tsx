"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Truck,
  Tag,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  Moon,
  ChevronDown,
  Globe,
  LogOut,
  ChevronUp,
  Building2,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminName,
  adminEmail,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/admin-logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  const isDashboardActive = pathname === "/admin/dashboard" || pathname === "/admin";
  const isInventoryActive = pathname.startsWith("/admin/inventory") || pathname.startsWith("/admin/catalog");
  const isOrdersActive = pathname.startsWith("/admin/orders");
  const isCustomersActive = pathname.startsWith("/admin/customers");
  const isDeliveryActive = pathname.startsWith("/admin/fulfillment");
  const isPromotionsActive = pathname.startsWith("/admin/harvest-drops");
  const isAnalyticsActive = pathname.startsWith("/admin/market-pulse");
  const isSettingsActive = pathname.startsWith("/admin/quality");
  const isNotificationsActive = pathname.startsWith("/admin/packaging");
  const isHelpActive = pathname.startsWith("/admin/suppliers");

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Top Brand Logo */}
      <div>
        <div className="p-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00c853] flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-stone-900 block leading-tight">
              Grocify
            </span>
            <span className="text-[10px] text-stone-400 font-semibold block tracking-wider uppercase">
              Fresh Harvest Ops
            </span>
          </div>
        </div>

        {/* Single Main Branch Indicator Card */}
        <div className="mx-4 mb-2 p-2.5 bg-stone-50 border border-stone-200/90 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#00c853] shadow-2xs shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-900 truncate">Main Branch</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c853]"></span>
            </div>
            <span className="text-[10px] text-stone-400 block truncate">Bengaluru Central Hub</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-4 py-2 space-y-6 text-xs font-semibold text-stone-600">
          {/* Group 1: MAIN MENU */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase px-3 py-1">
              MAIN MENU
            </div>

            {/* Dashboard */}
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isDashboardActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${isDashboardActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Dashboard</span>
            </Link>

            {/* Inventory */}
            <Link
              href="/admin/inventory"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isInventoryActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${isInventoryActive ? "text-white" : "text-stone-400"}`} />
                <span className="text-sm">Inventory</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            {/* Orders */}
            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isOrdersActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${isOrdersActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Orders</span>
            </Link>

            {/* Customers */}
            <Link
              href="/admin/customers"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isCustomersActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <Users className={`w-4 h-4 ${isCustomersActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Customers</span>
            </Link>
          </div>

          {/* Group 2: OPERATION & PROMOTION */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase px-3 py-1">
              OPERATION & PROMOTION
            </div>

            {/* Delivery */}
            <Link
              href="/admin/fulfillment"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isDeliveryActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className={`w-4 h-4 ${isDeliveryActive ? "text-white" : "text-stone-400"}`} />
                <span className="text-sm">Delivery</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            {/* Promotions */}
            <Link
              href="/admin/harvest-drops"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isPromotionsActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <Tag className={`w-4 h-4 ${isPromotionsActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Promotions</span>
            </Link>

            {/* Analytics */}
            <Link
              href="/admin/market-pulse"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isAnalyticsActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${isAnalyticsActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Analytics</span>
            </Link>
          </div>

          {/* Group 3: SETTING & SUPPORT */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase px-3 py-1">
              SETTING & SUPPORT
            </div>

            {/* Settings */}
            <Link
              href="/admin/quality"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isSettingsActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${isSettingsActive ? "text-white" : "text-stone-400"}`} />
                <span className="text-sm">Settings</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            {/* Notifications */}
            <Link
              href="/admin/packaging"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isNotificationsActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <Bell className={`w-4 h-4 ${isNotificationsActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Notifications</span>
            </Link>

            {/* Help Center */}
            <Link
              href="/admin/suppliers"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isHelpActive
                  ? "bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-bold"
                  : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${isHelpActive ? "text-white" : "text-stone-400"}`} />
              <span className="text-sm">Help Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Dark Mode Toggle & Admin User Pill */}
      <div className="p-4 border-t border-stone-200/80 space-y-3">
        {/* Dark Mode Switch */}
        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-600">
          <div className="flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-stone-500" />
            <span>Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
              darkMode ? "bg-[#00c853]" : "bg-stone-200"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                darkMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/30 overflow-hidden">
                <span className="text-sm">👨‍💼</span>
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-xs text-stone-900 block truncate">
                  {adminName || "Joseph Alpha"}
                </span>
                <span className="text-[10px] text-stone-400 block truncate">
                  {adminEmail || "user@gmail.com"}
                </span>
              </div>
            </div>
            {showProfileMenu ? (
              <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            )}
          </div>

          {/* Quick Sign Out Dropdown */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};


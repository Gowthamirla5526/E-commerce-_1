import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Store, User } from "lucide-react";

export const metadata = {
  title: "403 Access Denied | Fresh Harvest",
  description: "Administrator privileges required to access this portal.",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight pt-1">
            Admin Privileges Required
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            You are currently signed in with a <strong>Customer (USER)</strong> account. The darkstore operations console, inventory controls, and fulfillment tasks are strictly restricted to verified administrators.
          </p>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-left space-y-2 text-xs text-stone-600">
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Authenticated Role:</span>
            <span className="font-bold text-stone-800 bg-stone-200/80 px-2 py-0.5 rounded text-[11px]">
              USER / CUSTOMER
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Required Role:</span>
            <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-[11px]">
              ADMIN
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Security Rule:</span>
            <span className="font-semibold text-stone-700">RBAC Default-Deny</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/"
            className="w-full py-3 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Store className="w-4 h-4" />
            <span>Return to Customer Storefront</span>
          </Link>

          <div className="flex gap-2">
            <Link
              href="/account"
              className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Account</span>
            </Link>

            <Link
              href="/admin/login"
              className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


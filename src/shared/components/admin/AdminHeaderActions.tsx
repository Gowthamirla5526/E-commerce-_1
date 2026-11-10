"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

export const AdminHeaderActions: React.FC<{
  adminName: string;
  adminEmail: string;
}> = ({ adminName, adminEmail }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/admin-logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.warn("Admin logout error:", e);
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="bg-stone-800 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-stone-700">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <div className="text-left">
          <span className="text-stone-200 font-bold block leading-tight">{adminName}</span>
          <span className="text-[10px] text-emerald-400 font-mono block leading-tight">Role: ADMIN</span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg transition-colors font-medium cursor-pointer"
        title="Terminate Admin Session"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};


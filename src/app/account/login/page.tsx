"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("Ananya Sharma");
  const [email, setEmail] = useState("customer.ananya@example.com");
  const [password, setPassword] = useState("fresh123");
  const [phone, setPhone] = useState("+91 98765 43220");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isRegister
      ? "/api/v1/auth/customer-register"
      : "/api/v1/auth/customer-login";

    const payload = isRegister
      ? { name, email, password, phone }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Authentication failed.");
      }

      if (json.role === "ADMIN") {
        router.push(json.redirectUrl || "/admin/dashboard");
      } else {
        router.push(json.redirectUrl || "/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] text-white flex items-center justify-center mx-auto text-2xl shadow-sm">
          🥬
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c2421] tracking-tight">
          {isRegister ? "Join Fresh Harvest" : "Customer Sign In"}
        </h1>
        <p className="text-xs text-stone-500">
          Save your delivery addresses and track household produce batches.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#e8e3d9] rounded-2xl p-6 shadow-xs space-y-4">
        {isRegister && (
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#fbf9f5] border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
            />
          </div>
        )}

        <div className="space-y-1 text-xs">
          <label className="font-semibold text-stone-700">Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fbf9f5] border border-stone-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
            />
          </div>
        </div>

        {isRegister && (
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Phone Number *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#fbf9f5] border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
            />
          </div>
        )}

        <div className="space-y-1 text-xs">
          <label className="font-semibold text-stone-700">Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fbf9f5] border border-stone-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>{isRegister ? "Create Customer Account" : "Sign In & Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-[#2d6a4f] font-semibold hover:underline cursor-pointer"
          >
            {isRegister ? "Already have an account? Sign In" : "New to Fresh Harvest? Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}


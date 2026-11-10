"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Truck, RefreshCw, Scale, HeartHandshake } from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide customer footer on admin portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-[#1b4332] text-[#fbf9f5] border-t border-[#2d6a4f] mt-16">
      {/* 5 Core Trust Pillars */}
      <div className="border-b border-[#2d6a4f]/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start space-y-1.5">
              <ShieldCheck className="w-6 h-6 text-[#52b788]" />
              <h4 className="font-semibold text-sm text-white">100% Produce Only</h4>
              <p className="text-xs text-[#d8f3dc]/80">
                Zero dry grocery clutter. Dedicated strictly to fresh fruits & vegetables.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-1.5">
              <RefreshCw className="w-6 h-6 text-[#52b788]" />
              <h4 className="font-semibold text-sm text-white">Verified Batches</h4>
              <p className="text-xs text-[#d8f3dc]/80">
                Tracked from farm inwarding to your kitchen with real ripeness windows.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-1.5">
              <Truck className="w-6 h-6 text-[#52b788]" />
              <h4 className="font-semibold text-sm text-white">Gentle Cold-Chain</h4>
              <p className="text-xs text-[#d8f3dc]/80">
                Delivered in ventilated, reusable crates. No crushed leaves or bruised fruit.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-1.5">
              <Scale className="w-6 h-6 text-[#52b788]" />
              <h4 className="font-semibold text-sm text-white">Market Pulse Fair Pricing</h4>
              <p className="text-xs text-[#d8f3dc]/80">
                Transparent APMC wholesale mandi benchmarks published daily.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-1.5">
              <HeartHandshake className="w-6 h-6 text-[#52b788]" />
              <h4 className="font-semibold text-sm text-white">Zero Food Waste</h4>
              <p className="text-xs text-[#d8f3dc]/80">
                My Fridge intelligence helps you plan meals and avoid duplicate buying.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥬</span>
              <span className="font-bold text-lg text-white">Fresh Harvest</span>
            </div>
            <p className="text-xs text-[#d8f3dc]/70 leading-relaxed mb-4">
              Next-generation commercial e-commerce platform engineered specifically for fresh perishable fruits and vegetables.
            </p>
            <div className="text-xs text-[#d8f3dc]/60 space-y-1">
              <p>📍 Bengaluru Urban Core (Karnataka)</p>
              <p>🕒 Mon - Sun: 06:00 AM - 10:00 PM</p>
              <p>📞 +91 80 4912 3000</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#52b788] mb-3">
              Produce Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#d8f3dc]/80">
              <li><Link href="/fruits" className="hover:text-white transition-colors">Fresh Orchard Fruits</Link></li>
              <li><Link href="/vegetables" className="hover:text-white transition-colors">Daily Native Vegetables</Link></li>
              <li><Link href="/leafy" className="hover:text-white transition-colors">Morning-Cut Leafy Greens</Link></li>
              <li><Link href="/seasonal" className="hover:text-white transition-colors">Seasonal Peak Harvests</Link></li>
              <li><Link href="/regional" className="hover:text-white transition-colors">Regional Produce Explorer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#52b788] mb-3">
              Signature Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-[#d8f3dc]/80">
              <li><Link href="/matchmaker" className="hover:text-white transition-colors">Freshness Matchmaker</Link></li>
              <li><Link href="/fridge" className="hover:text-white transition-colors">My Fridge Intelligence</Link></li>
              <li><Link href="/fresh-plan" className="hover:text-white transition-colors">Seven-Day Fresh Plan</Link></li>
              <li><Link href="/harvest-drops" className="hover:text-white transition-colors">Community Harvest Drops</Link></li>
              <li><Link href="/perfect-pick" className="hover:text-white transition-colors">My Perfect Pick</Link></li>
              <li><Link href="/market-pulse" className="hover:text-white transition-colors">Market Pulse Benchmarks</Link></li>
              <li><Link href="/packaging" className="hover:text-white transition-colors">Returnable Crates System</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#52b788] mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#d8f3dc]/80">
              <li><Link href="/legal/delivery-policy" className="hover:text-white transition-colors">Delivery & Slot Policy</Link></li>
              <li><Link href="/legal/refund-policy" className="hover:text-white transition-colors">Freshness Guarantee & Refund Policy</Link></li>
              <li><Link href="/legal/packaging-policy" className="hover:text-white transition-colors">Returnable Packaging Deposit Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li className="pt-2">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2d6a4f] text-[#d8f3dc] text-[11px] font-mono hover:bg-[#52b788] hover:text-[#1b4332] transition-colors"
                >
                  🔒 Admin & Operations Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2d6a4f]/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#d8f3dc]/60">
          <p>© 2026 Fresh Harvest Produce Co. All rights reserved. Region: India (en-IN, Asia/Kolkata).</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">Next.js App Router • Strict TypeScript • Prisma ORM</p>
        </div>
      </div>
    </footer>
  );
};


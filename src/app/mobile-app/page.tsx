"use client";

import React, { useState } from "react";
import { MobileAppWalkthrough } from "@/shared/components/mobile/MobileAppWalkthrough";
import Link from "next/link";
import { Smartphone, ArrowLeft } from "lucide-react";

export default function MobileAppPresentationPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-2 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <h1 className="text-2xl font-black text-[#1c2421]">
          Fresh Harvest Mobile App Walkthrough
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Complete 8-step mobile presentation showcasing the first-run customer experience from splash to doorstep checkout.
        </p>
      </div>

      <MobileAppWalkthrough
        isOpen={isOpen}
        onClose={() => setIsOpen(true)} // Keep visible on this standalone page
      />
    </div>
  );
}


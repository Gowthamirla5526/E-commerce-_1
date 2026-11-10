import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, ArrowLeft, Clock, Package, CheckCircle2, FileText } from "lucide-react";

interface PolicyContent {
  title: string;
  lastUpdated: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
}

const POLICIES: Record<string, PolicyContent> = {
  "delivery-policy": {
    title: "Delivery & Slot Policy",
    lastUpdated: "November 2026",
    summary: "Guaranteed morning cold-chain delivery slots across Bengaluru Urban Core (PIN: 560038).",
    sections: [
      {
        heading: "1. Serviceability & Pincode Coverage",
        body: "Fresh Harvest currently operates out of the Main Branch (Bengaluru Central Hub) servicing Bengaluru central and eastern zones including Indiranagar, Bellandur, Koramangala, and HSR Layout (Pincode: 560038 and mapped zones).",
      },
      {
        heading: "2. Morning Express Cutoff & Time Windows",
        body: "Orders confirmed before 04:30 AM are dispatched for early bird delivery between 06:30 AM - 09:30 AM. Midday and evening dinner batches run from 11:30 AM - 02:30 PM and 05:30 PM - 08:30 PM respectively.",
      },
      {
        heading: "3. Delivery Charges",
        body: "All orders of ₹499 or higher receive complimentary zero-fee delivery. Standard cold-chain transit for orders below ₹499 incurs a flat ₹29 handling fee.",
      },
    ],
  },
  "refund-policy": {
    title: "Freshness Guarantee & Doorstep Refund Policy",
    lastUpdated: "November 2026",
    summary: "100% Satisfaction Guarantee: Inspect your fruits, vegetables, and leafy greens before paying.",
    sections: [
      {
        heading: "1. Doorstep Inspection Right",
        body: "Because our platform operates on Cash on Delivery (Pay with Cash / UPI at Doorstep), you have the absolute right to physically inspect every vegetable, fruit, and leafy green bunch before making payment.",
      },
      {
        heading: "2. Instant Item Rejection",
        body: "If any item does not meet your freshness expectations (bruises, over-ripeness, wilting), simply hand it back to the delivery partner. The delivery partner will adjust the bill immediately and you only pay for what you accept.",
      },
      {
        heading: "3. Post-Delivery Freshness Concerns",
        body: "If you detect an internal defect after cutting (e.g. within an avocado or papaya), report it via your Account Dashboard within 24 hours for an instant credit adjustment on your next order.",
      },
    ],
  },
  "packaging-policy": {
    title: "Returnable Circular Packaging Deposit Policy",
    lastUpdated: "November 2026",
    summary: "Zero single-use plastic crates with transparent refundable deposit ledger.",
    sections: [
      {
        heading: "1. The Reusable Crate Guarantee",
        body: "To eliminate single-use plastic bags and thermocol crates, every Fresh Harvest order is transported in food-grade, sanitised circular crates.",
      },
      {
        heading: "2. Crate Deposit & Returns",
        body: "A nominal ₹100 deposit per active crate is tracked in your customer ledger. Hand back empty crates to your delivery executive on your next delivery to immediately credit or return ₹100.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "November 2026",
    summary: "Standard consumer terms governing produce purchases and delivery through Fresh Harvest.",
    sections: [
      {
        heading: "1. Produce-Only Exclusivity",
        body: "Fresh Harvest is strictly dedicated to fresh farm produce (fruits, daily vegetables, and leafy greens). We do not stock or retail processed foods, grains, dairy, or non-perishable groceries.",
      },
      {
        heading: "2. Payment Terms",
        body: "Payment is strictly collected at your doorstep via Cash or dynamic UPI QR code. No online card details are requested or stored.",
      },
      {
        heading: "3. Order Cancellations",
        body: "You may cancel any confirmed order penalty-free before it transitions to the PICKED stage from your account dashboard.",
      },
    ],
  },
  privacy: {
    title: "Privacy & Data Protection Policy",
    lastUpdated: "November 2026",
    summary: "Compliance with Indian Digital Personal Data Protection (DPDP) Act.",
    sections: [
      {
        heading: "1. Data Collection & Purpose",
        body: "We only collect your name, contact mobile number, and doorstep delivery address for the sole purpose of dispatching your produce orders.",
      },
      {
        heading: "2. Zero Third-Party Advertising",
        body: "Your phone number and address are never sold or shared with third-party advertisers or lead-generation brokers.",
      },
      {
        heading: "3. Security Hardening",
        body: "All communications are secured with strict TLS encryption, HSTS, and timing-safe rate-limited authentication.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export default async function LegalPolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e8e3d9] shadow-xs space-y-8">
          <div className="border-b border-stone-100 pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Fresh Harvest Trust & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c2421] tracking-tight">
              {policy.title}
            </h1>
            <p className="text-xs text-stone-500">
              Last updated: {policy.lastUpdated} • Main Branch (Bengaluru Central Hub)
            </p>
            <p className="text-sm text-stone-700 pt-2 font-medium">
              {policy.summary}
            </p>
          </div>

          <div className="space-y-6">
            {policy.sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-base font-bold text-[#1c2421]">
                  {section.heading}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <span>Customer Support: support@freshharvest.co.in • +91 80 4912 3000</span>
            <Link
              href="/checkout"
              className="bg-[#2d6a4f] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#1b4332] transition-colors"
            >
              Return to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


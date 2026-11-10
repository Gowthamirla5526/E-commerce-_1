"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Package,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useCart } from "@/shared/context/CartContext";
import { formatPaise, formatGrams } from "@/core/types";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  streetLine1: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface Slot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export const CheckoutClient: React.FC<{ initialAddresses: Address[] }> = ({
  initialAddresses,
}) => {
  const router = useRouter();
  const { items, totalItems, subtotalPaise, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialAddresses.find((a) => a.isDefault)?.id || initialAddresses[0]?.id || ""
  );

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Address form modal state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState("Ananya Sharma");
  const [newPhone, setNewPhone] = useState("+91 98765 43220");
  const [newStreet, setNewStreet] = useState("Flat 402, Green Glen Terraces");
  const [newLocality, setNewLocality] = useState("Bellandur");
  const [newPincode, setNewPincode] = useState("560103");

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Fetch slots whenever address changes
  useEffect(() => {
    if (!selectedAddress) return;
    setIsLoadingSlots(true);

    fetch(`/api/v1/slots/available?pincode=${encodeURIComponent(selectedAddress.pincode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.slots) {
          setSlots(data.data.slots);
          const firstAvailable = data.data.slots.find((s: Slot) => s.isAvailable);
          if (firstAvailable) {
            setSelectedSlotId(firstAvailable.id);
          }
        }
      })
      .catch((err) => console.warn("Failed to load slots:", err))
      .finally(() => setIsLoadingSlots(false));
  }, [selectedAddress]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: newRecipient,
          phone: newPhone,
          streetLine1: newStreet,
          locality: newLocality,
          city: "Bengaluru",
          state: "Karnataka",
          pincode: newPincode,
          isDefault: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAddresses([json.data, ...addresses]);
        setSelectedAddressId(json.data.id);
        setShowAddressForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMessage("Please select or add a delivery address.");
      return;
    }
    if (!selectedSlotId) {
      setErrorMessage("Please select a valid delivery slot.");
      return;
    }
    if (items.length === 0) {
      setErrorMessage("Your basket is empty.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const idempotencyKey = `FH-IDEMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const payload = {
        addressId: selectedAddressId,
        deliverySlotId: selectedSlotId,
        deliveryDate: tomorrow.toISOString(),
        paymentMethod: "CASH_ON_DELIVERY" as const,
        idempotencyKey,
        items: items.map((i) => ({
          skuId: i.skuId,
          quantity: i.quantity,
          perfectPickSnapshotJson: i.batchReadiness ? `Ripeness: ${i.batchReadiness}` : null,
          freshnessDate: i.consumptionDate || null,
        })),
      };

      const res = await fetch("/api/v1/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to place order.");
      }

      clearCart();
      router.push(`/account/orders/${json.data.orderId}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const FREE_DELIVERY_THRESHOLD = 49900;
  const deliveryFee = subtotalPaise >= FREE_DELIVERY_THRESHOLD ? 0 : 2900;
  const packagingDeposit = 10000; // ₹100
  const totalPayable = subtotalPaise + deliveryFee + packagingDeposit;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1c2421]">Your basket is empty</h2>
        <p className="text-xs text-stone-500">Add fresh produce to proceed with checkout.</p>
        <Link
          href="/vegetables"
          className="inline-block bg-[#2d6a4f] text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Browse Vegetables
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1c2421] tracking-tight">
          Checkout & Fresh Produce Delivery
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review delivery details and pay conveniently on delivery.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address, Slot & Payment Steps */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2d6a4f] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-[#1c2421]">Delivery Address</h3>
              </div>

              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? "border-[#2d6a4f] bg-[#d8f3dc]/30 ring-1 ring-[#2d6a4f]"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-stone-900 mb-1">
                    <span>{addr.recipientName} ({addr.label})</span>
                    {selectedAddressId === addr.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />
                    )}
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    {addr.streetLine1}, {addr.locality}
                  </p>
                  <div className="text-[11px] font-mono text-stone-500 mt-1">
                    {addr.city} - {addr.pincode} • {addr.phone}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Collapsible */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                <div className="font-bold text-stone-800">Add Bengaluru Address</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street & Flat"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Locality"
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    className="p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-stone-500">Serviceable Core: Bengaluru 560103 / 560038</span>
                  <button type="submit" className="bg-[#2d6a4f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: Delivery Slot */}
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2d6a4f] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-[#1c2421]">Delivery Slot & Cold-Chain Window</h3>
            </div>

            {isLoadingSlots ? (
              <div className="text-xs text-stone-500 py-3">Loading available slots...</div>
            ) : slots.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                Pincode {selectedAddress?.pincode} verification in progress. Standard morning express active.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {slots.map((s) => (
                  <button
                    key={s.id}
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSlotId === s.id
                        ? "border-[#2d6a4f] bg-[#d8f3dc]/30 ring-1 ring-[#2d6a4f]"
                        : s.isAvailable
                        ? "border-stone-200 hover:border-stone-300 bg-white"
                        : "border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{s.startTime} - {s.endTime}</span>
                      {selectedSlotId === s.id && <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1">{s.name}</div>
                    {!s.isAvailable && (
                      <span className="text-[10px] text-red-600 block mt-1">{s.reason}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STEP 3: Payment Method (Exclusively Cash on Delivery) */}
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2d6a4f] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-[#1c2421]">Payment Method</h3>
              </div>
              <span className="bg-[#d8f3dc] text-[#1b4332] text-xs font-bold px-2.5 py-0.5 rounded-full">
                Zero Advance Risk
              </span>
            </div>

            {/* Cash on Delivery Card */}
            <div className="p-4 rounded-xl border-2 border-[#2d6a4f] bg-[#d8f3dc]/20 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1c2421]">
                    Cash on Delivery (Pay with Cash / UPI at Doorstep)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Inspect your fruits and vegetables before paying. Hand cash or scan the delivery partner&apos;s dynamic UPI QR code on your doorstep.
                </p>
                <div className="text-[11px] text-[#2d6a4f] font-semibold pt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Quality Assurance Guarantee: Pay only if you are completely satisfied.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#1c2421]">Basket Summary</h3>

            {/* Items Mini List */}
            <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto space-y-2 pr-1">
              {items.map((i) => (
                <div key={i.skuId} className="pt-2 first:pt-0 flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-800">{i.title}</span>
                    <span className="text-[11px] text-stone-400 block">
                      {i.quantity} x {formatGrams(i.packageSizeGrams)}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">
                    {formatPaise(i.sellingPricePaise * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
              <div className="flex justify-between">
                <span>Produce Total</span>
                <span className="font-bold text-stone-900">{formatPaise(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Morning Cold-Chain Delivery</span>
                <span className={`font-bold ${deliveryFee === 0 ? "text-[#2d6a4f]" : "text-stone-900"}`}>
                  {deliveryFee === 0 ? "FREE" : "₹29"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span>Returnable Crate Deposit</span>
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-1 py-0.2 rounded font-semibold">
                    Refundable
                  </span>
                </span>
                <span className="font-bold text-stone-900">{formatPaise(packagingDeposit)}</span>
              </div>
            </div>

            {/* Total Due at Doorstep */}
            <div className="border-t border-[#ede9df] pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-[11px] text-stone-500 block">Payable on Delivery</span>
                <span className="text-2xl font-extrabold text-[#1c2421]">
                  {formatPaise(totalPayable)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#2d6a4f]">Cash / UPI</span>
            </div>

            {/* Circular Packaging Banner */}
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#ede9df] text-xs text-stone-600 flex items-start gap-2">
              <Package className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
              <span>
                Orders arrive in ventilated reusable crates. Hand them back during your next delivery to instantly credit ₹100.
              </span>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Securing Batch & Placing Order...</span>
              ) : (
                <>
                  <span>Place Cash on Delivery Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


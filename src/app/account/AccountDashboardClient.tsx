"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Heart,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Layers,
  ChevronRight,
  LogOut,
  Sparkles,
  Calendar,
  Refrigerator,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  streetLine1: string;
  streetLine2?: string | null;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  addresses: Address[];
  _count: {
    orders: number;
    addresses: number;
  };
}

interface OrderPreview {
  id: string;
  orderNumber: string;
  totalPaise: number;
  fulfilmentStatus: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPricePaise: number;
  }>;
}

interface Props {
  initialUser: UserProfile;
  recentOrders: OrderPreview[];
}

export function AccountDashboardClient({ initialUser, recentOrders }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");

  // Profile Edit State
  const [name, setName] = useState(initialUser.name || "");
  const [email, setEmail] = useState(initialUser.email || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address Manager State
  const [addresses, setAddresses] = useState<Address[]>(initialUser.addresses || []);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: initialUser.name || "",
    phone: initialUser.phone || "",
    streetLine1: "",
    streetLine2: "",
    locality: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    label: "Home",
    isDefault: true,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Default address
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  // Handle Profile Update (Name, Email, Mobile)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/v1/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update profile details.");
      }

      setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
      router.refresh();
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Save Address (Create or Edit)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError(null);

    try {
      const isEditing = Boolean(editingAddressId);
      const url = "/api/v1/customer/addresses";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing ? { id: editingAddressId, ...addressForm } : addressForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save address.");
      }

      // Refresh addresses list
      const fetchRes = await fetch("/api/v1/customer/addresses");
      const fetchJson = await fetchRes.json();
      if (fetchJson.success && Array.isArray(fetchJson.data)) {
        setAddresses(fetchJson.data);
      }

      setIsAddressModalOpen(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (err: any) {
      setAddressError(err.message);
    } finally {
      setAddressSaving(false);
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery address?")) return;

    try {
      const res = await fetch(`/api/v1/customer/addresses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setAddresses(addresses.filter((a) => a.id !== id));
      } else {
        alert(json.error || "Failed to delete address.");
      }
    } catch (e: any) {
      alert("Error deleting address: " + e.message);
    }
  };

  // Open Edit Modal
  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      recipientName: addr.recipientName,
      phone: addr.phone,
      streetLine1: addr.streetLine1,
      streetLine2: addr.streetLine2 || "",
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      label: addr.label,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      recipientName: name,
      phone: phone,
      streetLine1: "",
      streetLine2: "",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      label: "Home",
      isDefault: addresses.length === 0,
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/customer-logout", { method: "POST" });
      router.push("/account/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Profile Header Bar */}
      <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] text-white flex items-center justify-center font-black text-2xl shadow-sm">
            {name?.[0] || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1c2421]">{name}</h1>
              <span className="text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332] px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2d6a4f]" /> Verified Member
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-stone-400" /> {email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-400" /> {phone || "+91 98765 43220"}</span>
            </p>
            {defaultAddress && (
              <p className="text-xs text-[#2d6a4f] font-medium mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Delivering to: <strong>{defaultAddress.label}</strong> ({defaultAddress.streetLine1}, {defaultAddress.locality}, {defaultAddress.pincode})</span>
              </p>
            )}
          </div>
        </div>

        {/* View Switcher Tabs: Dashboard (Shopper Hub) vs Settings */}
        <div className="flex items-center gap-2 bg-[#f4f1ea] p-1.5 rounded-2xl self-start md:self-auto border border-[#e8e3d9]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "dashboard"
                ? "bg-white text-[#1b4332] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#2d6a4f]" />
            <span>Shopper Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-white text-[#1b4332] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Settings className="w-4 h-4 text-[#2d6a4f]" />
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          TAB 1: SHOPPER DASHBOARD (What a real user needs daily)
          ======================================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Active Orders Tracker Card */}
          <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#2d6a4f]" />
                <h2 className="text-base font-bold text-[#1c2421]">Recent Produce Orders & Tracking</h2>
              </div>
              <Link
                href="/account/orders"
                className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
              >
                <span>All Orders ({initialUser._count.orders})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 2).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#1c2421]">{order.orderNumber}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332]">
                          {order.fulfilmentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} •{" "}
                        {order.items.length} produce {order.items.length === 1 ? "item" : "items"}
                      </p>
                      <p className="text-xs font-semibold text-stone-700 mt-0.5">
                        {order.items.map((i) => `${i.name} (x${i.quantity})`).slice(0, 3).join(", ")}
                        {order.items.length > 3 ? ` +${order.items.length - 3} more` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-[#1b4332]">
                        ₹{(order.totalPaise / 100).toFixed(0)}
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="px-3.5 py-2 rounded-xl bg-[#2d6a4f] text-white text-xs font-bold hover:bg-[#1b4332] transition-colors"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#fbf9f5] rounded-2xl border border-dashed border-[#e8e3d9]">
                <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-600 font-semibold">No recent orders yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Start shopping fresh fruits and vegetables harvested this morning!</p>
                <Link
                  href="/vegetables"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-xs font-bold hover:bg-[#1b4332] transition-colors"
                >
                  <span>Explore Produce Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Shopper Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/fruits"
              className="bg-white p-5 rounded-2xl border border-[#e8e3d9] hover:border-[#2d6a4f] hover:shadow-xs transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                  🍎
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1c2421]">Fresh Fruits</h3>
                  <p className="text-[11px] text-stone-500">21+ Orchard items</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#2d6a4f]" />
            </Link>

            <Link
              href="/vegetables"
              className="bg-white p-5 rounded-2xl border border-[#e8e3d9] hover:border-[#2d6a4f] hover:shadow-xs transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                  🥕
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1c2421]">Daily Veggies</h3>
                  <p className="text-[11px] text-stone-500">26+ Farm items</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#2d6a4f]" />
            </Link>

            <Link
              href="/leafy"
              className="bg-white p-5 rounded-2xl border border-[#e8e3d9] hover:border-[#2d6a4f] hover:shadow-xs transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-lg">
                  🌿
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1c2421]">Leafy Greens</h3>
                  <p className="text-[11px] text-stone-500">13+ Crisp varieties</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#2d6a4f]" />
            </Link>

            <Link
              href="/wishlist"
              className="bg-white p-5 rounded-2xl border border-[#e8e3d9] hover:border-rose-400 hover:shadow-xs transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1c2421]">Saved Produce</h3>
                  <p className="text-[11px] text-stone-500">View Wishlist</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-rose-500" />
            </Link>
          </div>

          {/* Delivery & Circular Packaging Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-3xl p-6 text-white flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#52b788] block">
                  Morning Slot Guarantee
                </span>
                <h3 className="text-lg font-black mt-1">Harvested at Dawn • Delivered Crisp</h3>
                <p className="text-xs text-white/80 mt-2">
                  Orders placed before 04:30 AM are packed directly from morning inward inspection and delivered between 06:30 - 09:30 AM.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span>Active Delivery Hub: <strong>Indiranagar</strong></span>
                <Link
                  href="/"
                  className="bg-white text-[#1b4332] px-3 py-1.5 rounded-xl font-bold hover:bg-[#d8f3dc] transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Zero Plastic Crate Deposit
                  </span>
                  <Package className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h3 className="text-base font-extrabold text-[#1c2421] mt-1">Returnable Eco Crate Ledger</h3>
                <p className="text-xs text-stone-500 mt-2">
                  You have 1 active sanitized produce crate in circulation. Return it during your next delivery to receive a ₹50 instant refund or credit.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#2d6a4f]">Deposit Balance: ₹50.00</span>
                <Link
                  href="/packaging"
                  className="text-stone-700 font-bold hover:text-[#2d6a4f] underline"
                >
                  Schedule Crate Pickup
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: SETTINGS (All configuration, profile change, address change)
          ======================================================================= */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Section 1: Personal Profile Details Change (Name, Mobile, Email) */}
          <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h2 className="text-base font-bold text-[#1c2421]">Change Personal Details</h2>
                <p className="text-xs text-stone-500">Update your account name, mobile number, and email address.</p>
              </div>
              <User className="w-5 h-5 text-[#2d6a4f]" />
            </div>

            {profileMessage && (
              <div
                className={`p-3.5 mb-6 rounded-xl text-xs flex items-center gap-2 border ${
                  profileMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {profileMessage.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-stone-700">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-stone-700">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43220"
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-stone-700">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {profileSaving ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Address Change & Management (Add, Edit, Delete, Set Default) */}
          <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-[#1c2421]">Delivery Addresses</h2>
                <p className="text-xs text-stone-500">Manage, edit, or add delivery addresses for home and work.</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  resetAddressForm();
                  setIsAddressModalOpen(true);
                }}
                className="px-4 py-2 bg-[#2d6a4f] text-white text-xs font-bold rounded-xl hover:bg-[#1b4332] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    addr.isDefault
                      ? "border-[#2d6a4f] bg-[#fbfdfb] ring-1 ring-[#2d6a4f]"
                      : "border-[#e8e3d9] bg-white hover:border-stone-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#d8f3dc] text-[#1b4332]">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-[#2d6a4f] flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Default Delivery Location
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditAddress(addr)}
                        className="p-1.5 text-stone-500 hover:text-[#2d6a4f] hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-[#1c2421]">{addr.recipientName} • {addr.phone}</p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {addr.streetLine1}
                    {addr.streetLine2 ? `, ${addr.streetLine2}` : ""}, {addr.locality}, {addr.city} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Produce Services & Utilities Kept in Settings */}
          <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#1c2421] mb-1">Produce Tools & Services</h2>
            <p className="text-xs text-stone-500 mb-4">Smart kitchen features configured for your household.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/fridge"
                className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#e85d04] flex items-center justify-center">
                  <Refrigerator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1c2421]">Fridge Tracker</h4>
                  <p className="text-[10px] text-stone-500">Monitor produce freshness</p>
                </div>
              </Link>

              <Link
                href="/fresh-plan"
                className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1c2421]">7-Day Fresh Plan</h4>
                  <p className="text-[10px] text-stone-500">Stock-aware meal schedule</p>
                </div>
              </Link>

              <Link
                href="/matchmaker"
                className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] transition-all flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1c2421]">Matchmaker</h4>
                  <p className="text-[10px] text-stone-500">Usage-based suggestions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Section 4: Security & Logout */}
          <div className="bg-white rounded-3xl border border-[#e8e3d9] p-6 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1c2421]">Customer Session & Security</h3>
              <p className="text-xs text-stone-500">Active role: USER (Protected Customer Portal)</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: ADD / EDIT DELIVERY ADDRESS
          ======================================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#e8e3d9] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-[#1c2421]">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">House / Flat / Apartment No. & Street *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Green Glen Gardens, 12th Main"
                  value={addressForm.streetLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, streetLine1: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Indiranagar Metro Station"
                  value={addressForm.streetLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, streetLine2: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">City</label>
                  <input
                    type="text"
                    readOnly
                    value={addressForm.city}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-700 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {["Home", "Work", "Other"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        addressForm.label === label
                          ? "bg-[#2d6a4f] text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                  />
                  <span>Set as Default</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="px-5 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4332] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {addressSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


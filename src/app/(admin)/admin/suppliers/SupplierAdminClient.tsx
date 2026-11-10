"use client";

import React, { useState } from "react";
import { Plus, Check, AlertCircle, Phone, MapPin } from "lucide-react";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName: string;
  phone: string;
  email: string | null;
  district: string;
  state: string;
  _count?: {
    inventoryBatches: number;
  };
}

export const SupplierAdminClient: React.FC<{
  initialSuppliers: Supplier[];
}> = ({ initialSuppliers }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Karnataka");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code) {
      setCode(
        `SUP-${val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        name,
        code,
        contactName,
        phone,
        email: email || null,
        district,
        state,
      };

      const res = await fetch("/api/v1/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add supplier.");
      }

      setMessage({ text: "Supplier registered successfully!", type: "success" });
      setShowAddForm(false);
      setName("");
      setCode("");
      setContactName("");
      setPhone("");
      setDistrict("");

      // Refresh
      const updatedRes = await fetch("/api/v1/admin/suppliers");
      const updatedJson = await updatedRes.json();
      if (updatedJson.success) {
        setSuppliers(updatedJson.data);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Supplier & Farm Origin Registry
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered FPOs, orchards and horticulture collectives supplying verified batches.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Register Farm Supplier"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900">Register New Farm Collective / Supplier</h3>
            <p className="text-xs text-stone-500">Only verified producer organizations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Organization Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Mandya Horticultural Farmers Collective"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Supplier Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUP-MANDYA-FPO"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Contact Person *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Shivananda Gowda"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 8232 245100"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">District / Region *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Mandya"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-stone-300 text-xs text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Register Supplier"}
            </button>
          </div>
        </form>
      )}

      {/* Supplier Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-700">
              <tr>
                <th className="py-3 px-4">Supplier Code</th>
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Active Batches Supplied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">{s.code}</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">{s.name}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="font-medium text-stone-800 block">{s.contactName}</span>
                      <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#2d6a4f]" /> {s.phone}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {s.district}, {s.state}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#2d6a4f]">
                    {s._count?.inventoryBatches || 0} batches
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


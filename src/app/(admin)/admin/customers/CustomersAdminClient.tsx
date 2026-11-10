"use client";

import React, { useState } from "react";
import { Users, Mail, Phone, Calendar, ShoppingBag, ShieldCheck } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  orderCount: number;
  fridgeItemCount: number;
  joinedAt: string;
}

export const CustomersAdminClient: React.FC<{
  customers: CustomerRecord[];
}> = ({ customers }) => {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Customer Accounts & Roles
          </h1>
          <p className="text-xs text-stone-500">
            RBAC User Directory: Verify verified customer accounts, order histories, and enforce strict role boundaries.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Produce Orders</th>
                <th className="py-3 px-4">Fridge Items</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block">{customer.name}</span>
                    <span className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{customer.email}</span>
                      {customer.phone && <span>• {customer.phone}</span>}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        customer.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {customer.role === "ADMIN" ? "ADMIN" : "USER"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-800">
                    {customer.orderCount} {customer.orderCount === 1 ? "order" : "orders"}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {customer.fridgeItemCount} cached
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {new Date(customer.joinedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active
                    </span>
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


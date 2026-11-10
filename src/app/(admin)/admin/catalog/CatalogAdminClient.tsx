"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Boxes, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { formatPaise, formatGrams } from "@/core/types";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  originRegion: string | null;
  featuredImageUrl: string;
  category: {
    name: string;
  };
  skus: Array<{
    id: string;
    skuCode: string;
    sellingPricePaise: number;
    mrpPaise: number;
    packageSizeGrams: number;
  }>;
}

export const CatalogAdminClient: React.FC<{
  initialProducts: Product[];
  categories: Category[];
}> = ({ initialProducts, categories }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [scientificName, setScientificName] = useState("");
  const [originRegion, setOriginRegion] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
  );
  const [skuCode, setSkuCode] = useState("");
  const [packageSizeGrams, setPackageSizeGrams] = useState(500);
  const [sellingPriceRupees, setSellingPriceRupees] = useState(35);
  const [mrpRupees, setMrpRupees] = useState(45);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        title,
        slug,
        categoryId,
        scientificName: scientificName || null,
        description,
        originRegion: originRegion || null,
        featuredImageUrl,
        isSeasonal: false,
        active: true,
        sku: {
          skuCode: skuCode || `SKU-${slug.toUpperCase()}-500G`,
          packageSizeGrams: Number(packageSizeGrams),
          sellingPricePaise: Math.round(Number(sellingPriceRupees) * 100),
          mrpPaise: Math.round(Number(mrpRupees) * 100),
          unitType: "GRAMS",
        },
      };

      const res = await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create product.");
      }

      setMessage({ text: "Product published to storefront successfully!", type: "success" });
      setShowAddForm(false);
      // Reset
      setTitle("");
      setSlug("");
      setDescription("");

      // Refresh list
      const updatedRes = await fetch("/api/v1/admin/products");
      const updatedJson = await updatedRes.json();
      if (updatedJson.success) {
        setProducts(updatedJson.data);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Produce Catalog & SKU Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Publish products and SKUs. Changes appear immediately on the customer storefront.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Add New Produce SKU"}</span>
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

      {/* Add Produce Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateProduct}
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900">Add New Perishable Product</h3>
            <p className="text-xs text-stone-500">
              Prices will be converted into integer paise automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Produce Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Ooty Crisp Red Radish"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ooty-crisp-red-radish"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Produce Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Origin / Terroir</label>
              <input
                type="text"
                value={originRegion}
                onChange={(e) => setOriginRegion(e.target.value)}
                placeholder="e.g. Nilgiris, Tamil Nadu"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Selling Price (INR ₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={sellingPriceRupees}
                onChange={(e) => setSellingPriceRupees(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-bold focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">MRP / Benchmark Price (INR ₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={mrpRupees}
                onChange={(e) => setMrpRupees(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Package Size (Grams) *</label>
              <input
                type="number"
                required
                min="50"
                step="50"
                value={packageSizeGrams}
                onChange={(e) => setPackageSizeGrams(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Image URL</label>
              <input
                type="url"
                required
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 text-xs focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crisp high-altitude radish with delicate peppery crunch and tender skin..."
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-[#2d6a4f]"
            />
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
              {isLoading ? "Saving..." : "Save & Publish Product"}
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-700">
              <tr>
                <th className="py-3 px-4">Produce</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Origin Region</th>
                <th className="py-3 px-4">Active SKU</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Storefront Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const sku = p.skus[0];
                return (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          <Image
                            src={p.featuredImageUrl}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{p.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono">/{p.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium">{p.category.name}</td>

                    <td className="py-3 px-4">
                      {p.originRegion ? (
                        <span className="text-stone-700">📍 {p.originRegion}</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-600">
                      {sku ? `${sku.skuCode} (${formatGrams(sku.packageSizeGrams)})` : "No SKU"}
                    </td>

                    <td className="py-3 px-4 font-bold text-stone-900">
                      {sku ? formatPaise(sku.sellingPricePaise) : "—"}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]"></span>
                        Live on Store
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  TrendingUp,
  ShoppingBag,
  Users,
  Truck,
  DollarSign,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MousePointer,
  CheckCircle2,
  X,
  Download,
  FileSpreadsheet,
  Calendar,
  FileText,
  Clock,
  Building2,
} from "lucide-react";

export interface DashboardProduct {
  id: string;
  title: string;
  txnId: string;
  priceFormatted: string;
  views: string;
  clicks: string;
  quantity: string;
  revenue: string;
  status: "Active" | "Depleted" | "Pending";
  imageUrl: string;
  category: string;
}

interface GrossVolumeBreakdown {
  amount: string;
  change: string;
  cod: string;
  codPercent: number;
  online: string;
  onlinePercent: number;
  instore: string;
  instorePercent: number;
}

interface DashboardClientProps {
  initialProducts: DashboardProduct[];
  stats: {
    totalSales: string;
    totalOrders: string;
    totalUsers: string;
    delivery: string;
    grossVolume: string;
    grossVolumeDay?: GrossVolumeBreakdown;
    grossVolumeWeek?: GrossVolumeBreakdown;
    grossVolumeMonth?: GrossVolumeBreakdown;
  };
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  initialProducts,
  stats,
}) => {
  const [products, setProducts] = useState<DashboardProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("Daily");
  const [selectedGrossPeriod, setSelectedGrossPeriod] = useState<"Day" | "Week" | "Month">("Month");
  const [aiReportGenerated, setAiReportGenerated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadPeriod, setDownloadPeriod] = useState<"day" | "week" | "month" | "year">("month");

  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "Fresh Fruits",
    price: "",
    quantity: "",
  });

  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Pending" | "Depleted">("ALL");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    const added: DashboardProduct = {
      id: `prod-${Date.now()}`,
      title: newProduct.title,
      txnId: `#GR${Math.floor(10 + Math.random() * 90)}`,
      priceFormatted: `$${parseFloat(newProduct.price).toFixed(2)}`,
      views: "1,200",
      clicks: "45%",
      quantity: newProduct.quantity || "1,000",
      revenue: `$${(parseFloat(newProduct.price) * (parseInt(newProduct.quantity) || 100)).toFixed(0)}`,
      status: "Active",
      imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
      category: newProduct.category,
    };

    setProducts([added, ...products]);
    setShowAddModal(false);
    setNewProduct({ title: "", category: "Fresh Fruits", price: "", quantity: "" });
  };

  // Trigger real CSV spreadsheet download via the protected API
  const handleDownloadReport = (period: "day" | "week" | "month" | "year") => {
    const url = `/api/v1/admin/reports/download?period=${period}&format=csv`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FreshHarvest_Sales_Report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gross volume data mapping for Day, Week, and Month
  const grossVolumeData: Record<"Day" | "Week" | "Month", GrossVolumeBreakdown> = {
    Day: stats.grossVolumeDay || {
      amount: "$2,840",
      change: "▲ 12%",
      cod: "$2,150",
      codPercent: 75,
      online: "$520",
      onlinePercent: 18,
      instore: "$170",
      instorePercent: 7,
    },
    Week: stats.grossVolumeWeek || {
      amount: "$18,650",
      change: "▲ 18%",
      cod: "$13,200",
      codPercent: 71,
      online: "$4,100",
      onlinePercent: 22,
      instore: "$1,350",
      instorePercent: 7,
    },
    Month: stats.grossVolumeMonth || {
      amount: stats.grossVolume || "$41,540",
      change: "▲ 15%",
      cod: "$26,800",
      codPercent: 65,
      online: "$10,400",
      onlinePercent: 25,
      instore: "$4,340",
      instorePercent: 10,
    },
  };

  const currentGross = grossVolumeData[selectedGrossPeriod];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      {/* -----------------------------------------------------------------------
          MAIN BRANCH CONTEXT BAR (Single Branch Operations)
          ----------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#00c853] flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">
                Main Branch (Bengaluru Central Hub)
              </h1>
              <span className="bg-[#00c853]/15 text-[#00a344] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#00c853]/30">
                Single Active Branch
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Code: <strong className="text-stone-700 font-mono">MAIN-BLR-01</strong> • PIN: <strong>560038</strong> • All live store metrics, inventory & fulfillment are routed through this primary facility.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200/80 px-3.5 py-2 rounded-xl shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00c853] animate-pulse"></span>
          <span>Branch Operational: <strong className="text-stone-900 font-bold">100% Online</strong></span>
        </div>
      </div>
      {/* -----------------------------------------------------------------------
          1. AI USER REPORTS BANNER (With Instant Report Downloads)
          ----------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ffe5e5] via-[#fff1f1] to-white border border-[#ffd2d2]/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            AI User Reports & Business Statement Engine
          </h2>
          <p className="text-xs text-stone-500">
            Export daily, weekly, monthly, and yearly sales audits with one click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowDownloadModal(true)}
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#00c853]" />
            <span>Download Reports</span>
          </button>

          <button
            onClick={() => setAiReportGenerated(true)}
            className="inline-flex items-center gap-2 bg-[#00c853] hover:bg-[#00b248] active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Generate Auto Reports</span>
          </button>
        </div>
      </div>

      {aiReportGenerated && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">AI Business Audit Ready:</span>
              <span className="text-stone-600">
                Order fulfilment SLA running at 98.4%. Cash on Delivery collections reconciled at ₹41,540 with zero FEFO batch wastage across 62 live produce SKUs.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownloadReport("month")}
              className="text-[11px] font-bold bg-[#00c853] text-white px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#00b248]"
            >
              Export CSV
            </button>
            <button
              onClick={() => setAiReportGenerated(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          QUICK PERIOD DOWNLOAD BAR (Day, Week, Month, Year Direct Buttons)
          ----------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-stone-700">
          <FileSpreadsheet className="w-4 h-4 text-[#00c853]" />
          <span>Quick Business Statement Downloads:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleDownloadReport("day")}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-[#00c853] hover:text-white border border-stone-200 text-stone-700 font-semibold transition-all cursor-pointer group"
          >
            <Clock className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
            <span>Today (Day)</span>
          </button>

          <button
            onClick={() => handleDownloadReport("week")}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-[#00c853] hover:text-white border border-stone-200 text-stone-700 font-semibold transition-all cursor-pointer group"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
            <span>Week (7 Days)</span>
          </button>

          <button
            onClick={() => handleDownloadReport("month")}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-[#00c853] hover:text-white border border-stone-200 text-stone-700 font-semibold transition-all cursor-pointer group"
          >
            <FileText className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
            <span>Month (30 Days)</span>
          </button>

          <button
            onClick={() => handleDownloadReport("year")}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-[#00c853] hover:text-white border border-stone-200 text-stone-700 font-semibold transition-all cursor-pointer group"
          >
            <Download className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
            <span>Year (Annual)</span>
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          2. FOUR STAT / KPI CARDS (Cloned from Reference Grid)
          ----------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center font-bold shadow-xs">
              <DollarSign className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              ▼ 45%
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
                Total Sales
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight block mt-0.5">
                {stats.totalSales || "$500K"}
              </span>
            </div>

            {/* Mini purple vertical bar chart */}
            <div className="flex items-end gap-1 h-8">
              <span className="w-1.5 h-3 bg-purple-200 rounded-xs"></span>
              <span className="w-1.5 h-5 bg-purple-300 rounded-xs"></span>
              <span className="w-1.5 h-7 bg-purple-500 rounded-xs"></span>
              <span className="w-1.5 h-4 bg-purple-400 rounded-xs"></span>
              <span className="w-1.5 h-8 bg-[#7c3aed] rounded-xs"></span>
              <span className="w-1.5 h-2 bg-purple-200 rounded-xs"></span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag className="w-5 h-5 text-[#0284c7]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              ▲ 25%
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight block mt-0.5">
                {stats.totalOrders || "20K"}
              </span>
            </div>

            {/* Mini blue vertical bar chart */}
            <div className="flex items-end gap-1 h-8">
              <span className="w-1.5 h-4 bg-sky-200 rounded-xs"></span>
              <span className="w-1.5 h-6 bg-sky-300 rounded-xs"></span>
              <span className="w-1.5 h-8 bg-[#0284c7] rounded-xs"></span>
              <span className="w-1.5 h-5 bg-sky-400 rounded-xs"></span>
              <span className="w-1.5 h-7 bg-sky-500 rounded-xs"></span>
              <span className="w-1.5 h-3 bg-sky-200 rounded-xs"></span>
            </div>
          </div>
        </div>

        {/* Card 3: Total User */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#fce7f3] text-[#db2777] flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5 text-[#db2777]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              ▼ 45%
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
                Total User
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight block mt-0.5">
                {stats.totalUsers || "145K"}
              </span>
            </div>

            {/* Mini pink vertical bar chart */}
            <div className="flex items-end gap-1 h-8">
              <span className="w-1.5 h-3 bg-pink-200 rounded-xs"></span>
              <span className="w-1.5 h-7 bg-[#db2777] rounded-xs"></span>
              <span className="w-1.5 h-4 bg-pink-400 rounded-xs"></span>
              <span className="w-1.5 h-6 bg-pink-300 rounded-xs"></span>
              <span className="w-1.5 h-5 bg-pink-400 rounded-xs"></span>
              <span className="w-1.5 h-2 bg-pink-200 rounded-xs"></span>
            </div>
          </div>
        </div>

        {/* Card 4: Delivery */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5 text-[#16a34a]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              ▲ 25%
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
                Delivery
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight block mt-0.5">
                {stats.delivery || "45K"}
              </span>
            </div>

            {/* Mini emerald vertical bar chart */}
            <div className="flex items-end gap-1 h-8">
              <span className="w-1.5 h-4 bg-emerald-200 rounded-xs"></span>
              <span className="w-1.5 h-5 bg-emerald-300 rounded-xs"></span>
              <span className="w-1.5 h-6 bg-emerald-400 rounded-xs"></span>
              <span className="w-1.5 h-8 bg-[#16a34a] rounded-xs"></span>
              <span className="w-1.5 h-5 bg-emerald-300 rounded-xs"></span>
              <span className="w-1.5 h-3 bg-emerald-200 rounded-xs"></span>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          3. MIDDLE SECTION: "Sales Overtime" (65%) & "Gross Volume" (35%)
          ----------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT CARD: Sales Overtime */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/70 shadow-xs flex flex-col justify-between space-y-6">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900">Sales Overtime</h3>
            <div className="relative">
              <button
                onClick={() => setSelectedInterval(selectedInterval === "Daily" ? "Weekly" : "Daily")}
                className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                <span>{selectedInterval}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Subheader metrics along chart top */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] text-stone-500 border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] text-stone-400 block">Opening Sales</span>
              <span className="font-bold text-stone-800 text-xs">44.8k</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Second Interval</span>
              <span className="font-bold text-stone-800 text-xs">36.2k</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Midpoint Sales</span>
              <span className="font-bold text-stone-800 text-xs">29.7k</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-600 font-bold block">Pre-Drop Sales</span>
              <span className="font-black text-blue-700 text-xs">21.5k</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Late Sales</span>
              <span className="font-bold text-stone-800 text-xs">14.1k</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Closing Sales</span>
              <span className="font-bold text-stone-800 text-xs">8.1k</span>
            </div>
          </div>

          {/* Stepped Histogram Chart with Diagonal Striping and Tooltip (Matches Screenshot) */}
          <div className="relative h-56 w-full flex items-end justify-between pt-6 px-2">
            {/* Y-axis guidelines */}
            <div className="absolute inset-x-0 top-0 flex flex-col justify-between h-48 pointer-events-none text-[10px] text-stone-300 border-b border-stone-100">
              <div className="border-b border-dashed border-stone-100 pb-0.5">50k</div>
              <div className="border-b border-dashed border-stone-100 pb-0.5">40k</div>
              <div className="border-b border-dashed border-stone-100 pb-0.5">30k</div>
              <div className="border-b border-dashed border-stone-100 pb-0.5">20k</div>
            </div>

            {/* Stepped Blue Striped Histogram Bars */}
            <div className="w-full h-44 flex items-end justify-around relative z-10 pl-6">
              {/* Bar 1: 44.8k */}
              <div className="w-12 sm:w-16 h-full flex flex-col justify-end group">
                <div
                  className="w-full bg-[#3b82f6]/80 rounded-t-lg transition-all group-hover:bg-[#2563eb]"
                  style={{
                    height: "90%",
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)",
                  }}
                ></div>
              </div>

              {/* Bar 2: 36.2k */}
              <div className="w-12 sm:w-16 h-full flex flex-col justify-end group">
                <div
                  className="w-full bg-[#3b82f6]/85 rounded-t-lg transition-all group-hover:bg-[#2563eb]"
                  style={{
                    height: "75%",
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)",
                  }}
                ></div>
              </div>

              {/* Bar 3: 29.7k */}
              <div className="w-12 sm:w-16 h-full flex flex-col justify-end group">
                <div
                  className="w-full bg-[#3b82f6]/90 rounded-t-lg transition-all group-hover:bg-[#2563eb]"
                  style={{
                    height: "60%",
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)",
                  }}
                ></div>
              </div>

              {/* Bar 4: 21.5k (Active Focus Bar with Cursor & Tooltip in Screenshot) */}
              <div className="w-12 sm:w-16 h-full flex flex-col justify-end relative group">
                {/* Active Tooltip matching screenshot */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-lg flex items-center gap-1.5 z-20 pointer-events-none">
                  <span>21.5k Pre-Drop Sales</span>
                  <span className="text-stone-400">|</span>
                  <span className="text-emerald-400">Conversion: 89%</span>
                </div>

                {/* Mouse cursor indicator */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <MousePointer className="w-4 h-4 text-stone-900 fill-stone-900 filter drop-shadow" />
                </div>

                <div
                  className="w-full bg-[#1d4ed8] rounded-t-lg shadow-md ring-2 ring-blue-400/50"
                  style={{
                    height: "45%",
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.25) 5px, rgba(255,255,255,0.25) 10px)",
                  }}
                ></div>
              </div>

              {/* Bar 5: 14.1k */}
              <div className="w-12 sm:w-16 h-full flex flex-col justify-end group">
                <div
                  className="w-full bg-[#60a5fa]/70 rounded-t-lg transition-all group-hover:bg-[#3b82f6]"
                  style={{
                    height: "30%",
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)",
                  }}
                ></div>
              </div>

              {/* Bar 6: 8.1k */}
              <div className="w-12 sm:w-16 h-full flex flex-col justify-end group">
                <div
                  className="w-full bg-[#93c5fd]/60 rounded-t-lg transition-all group-hover:bg-[#3b82f6]"
                  style={{
                    height: "18%",
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom AI Exploration Prompt Strip (Reference Screenshot) */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-xl p-3 border border-blue-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-stone-800 shrink-0">
                What would you like to explore next?
              </span>
              <span className="text-stone-400 truncate hidden sm:inline">
                I want to know what caused the drop-off from authorized to sales overtime |
              </span>
            </div>
            <button
              onClick={() => handleDownloadReport("month")}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer flex items-center gap-1 active:scale-95"
              title="Download Monthly Business Analysis CSV"
            >
              <span>Explore</span>
              <span>↗</span>
            </button>
          </div>
        </div>

        {/* RIGHT CARD: Gross Volume (With Day, Week, and Month Selectors) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/70 shadow-xs flex flex-col justify-between space-y-6">
          {/* Header with Day, Week, Month selector tabs */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900">Gross Volume</h3>

            {/* Day / Week / Month Tab Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-bold">
              {(["Day", "Week", "Month"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedGrossPeriod(period)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedGrossPeriod === period
                      ? "bg-white text-stone-900 shadow-xs font-black"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Big Stat matching selected period */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {currentGross.amount}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {currentGross.change}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Total gross receipts ({selectedGrossPeriod} period) for Main Branch (Bengaluru Central Hub)
            </p>
          </div>

          {/* Striped Breakdown Progress Bars (Reference Screenshot) */}
          <div className="space-y-4 pt-2">
            {/* 1. Cash on Delivery (Primary Payment Method) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00c853]"></span>
                  Cash on Delivery
                </span>
                <span className="text-stone-900">{currentGross.cod}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00c853] rounded-full transition-all duration-500"
                  style={{
                    width: `${currentGross.codPercent}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)",
                  }}
                ></div>
              </div>
            </div>

            {/* 2. Online Payments */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Online Payments
                </span>
                <span className="text-stone-900">{currentGross.online}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                  style={{
                    width: `${currentGross.onlinePercent}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)",
                  }}
                ></div>
              </div>
            </div>

            {/* 3. In-Store / Farm Purchases */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-rose-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  In-Store Purchases
                </span>
                <span className="text-stone-900">{currentGross.instore}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ec4899] rounded-full transition-all duration-500"
                  style={{
                    width: `${currentGross.instorePercent}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          4. BOTTOM SECTION: "Product Overview" TABLE (Matches Screenshot)
          ----------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-xs p-5 sm:p-6 space-y-4">
        {/* Table Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-bold text-base text-stone-900">Product Overview</h3>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#f8fafc] border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#00c853] w-40 sm:w-52 transition-all"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => {
                const next: Record<string, "ALL" | "Active" | "Pending" | "Depleted"> = {
                  ALL: "Active",
                  Active: "Pending",
                  Pending: "Depleted",
                  Depleted: "ALL",
                };
                setStatusFilter(next[statusFilter]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                statusFilter !== "ALL"
                  ? "bg-[#00c853] text-white border-[#00c853]"
                  : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
              }`}
              title="Click to cycle status filter (ALL ➔ Active ➔ Pending ➔ Depleted)"
            >
              <Filter className={`w-3.5 h-3.5 ${statusFilter !== "ALL" ? "text-white" : "text-stone-500"}`} />
              <span>Filter: <strong>{statusFilter}</strong></span>
              {statusFilter !== "ALL" && (
                <span className="ml-1 text-[10px] bg-white text-[#00c853] font-bold px-1.5 py-0.2 rounded-full">
                  {filteredProducts.length}
                </span>
              )}
            </button>

            {/* Add Products Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00c853] hover:bg-[#00b248] active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Products</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#f8fafc] border-y border-stone-200/80 font-bold text-stone-500">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input type="checkbox" className="rounded text-[#00c853] focus:ring-0" />
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Product</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Price</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>View</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Click</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Quantity</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Revenue</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Status</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <input type="checkbox" className="rounded text-[#00c853] focus:ring-0" />
                  </td>

                  {/* Product Cell: Icon + Name + Txn ID */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block leading-tight hover:text-[#00c853] transition-colors cursor-pointer">
                          {p.title}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                          Txn ID: {p.txnId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 font-bold text-stone-900">
                    {p.priceFormatted}
                  </td>

                  {/* View */}
                  <td className="py-3 px-3 text-stone-600 font-mono">
                    {p.views}
                  </td>

                  {/* Click */}
                  <td className="py-3 px-3 text-stone-600 font-mono">
                    {p.clicks}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-stone-600 font-mono">
                    {p.quantity}
                  </td>

                  {/* Revenue */}
                  <td className="py-3 px-3 font-bold text-stone-900">
                    {p.revenue}
                  </td>

                  {/* Status: Green pill "● Active" in screenshot */}
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00c853]"></span>
                      Active
                    </span>
                  </td>

                  {/* Action Menu */}
                  <td className="py-3 px-3 text-right">
                    <button className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          5. BUSINESS STATEMENT DOWNLOAD MODAL (Day, Week, Month, Year)
          ----------------------------------------------------------------------- */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00c853] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-stone-900">Export Business Report</h4>
                  <p className="text-[11px] text-stone-400">Download formatted sales & inventory spreadsheets</p>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Select Reporting Period</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "day", title: "Daily Report", subtitle: "Today's orders & dispatch", icon: Clock },
                  { id: "week", title: "Weekly Report", subtitle: "Last 7 days performance", icon: Calendar },
                  { id: "month", title: "Monthly Report", subtitle: "Last 30 days financial audit", icon: FileText },
                  { id: "year", title: "Yearly Report", subtitle: "Annual P&L statement", icon: Download },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = downloadPeriod === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setDownloadPeriod(item.id as any)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#00c853] bg-emerald-50/60 text-[#00c853] ring-1 ring-[#00c853]"
                          : "border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#00c853]" : "text-stone-400"}`} />
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? "border-[#00c853] bg-[#00c853]" : "border-stone-300"}`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="font-bold text-xs block text-stone-900">{item.title}</span>
                        <span className="text-[10px] text-stone-500 block">{item.subtitle}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Report Content Overview */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs text-stone-600">
              <span className="font-bold text-stone-800 block">Report Inclusions:</span>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-stone-500">
                <li>Detailed Order Numbers, timestamps, and customer contact information.</li>
                <li>Produce itemizations (Fruits, Vegetables, Leafy Greens) with exact weights.</li>
                <li>Cash on Delivery collections breakdown with doorstep verification.</li>
                <li>Subtotals, packaging deposits, delivery fees, and net revenue.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-600 font-semibold rounded-xl text-xs hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadReport(downloadPeriod);
                  setShowDownloadModal(false);
                }}
                className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b248] active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {downloadPeriod.toUpperCase()} Report (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          6. ADD PRODUCT MODAL (For "+ Add Products" Button)
          ----------------------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-base text-stone-900">Add New Produce SKU</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Nagpur Oranges"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00c853]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00c853]"
                >
                  <option value="Fresh Fruits">Fresh Fruits</option>
                  <option value="Daily Vegetables">Daily Vegetables</option>
                  <option value="Leafy Vegetables & Greens">Leafy Vegetables & Greens</option>
                  <option value="Seasonal Harvests">Seasonal Harvests</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Selling Price ($/₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00c853]"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 font-semibold rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00c853] hover:bg-[#00b248] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Produce SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

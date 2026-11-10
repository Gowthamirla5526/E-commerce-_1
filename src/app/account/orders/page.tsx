import React from "react";
import Link from "next/link";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { formatPaise, formatGrams } from "@/core/types";
import { ShoppingBag, ChevronRight, Clock, MapPin, ArrowRight } from "lucide-react";

export const revalidate = 0; // Live order history

export default async function CustomerOrdersPage() {
  const session = await getCustomerSession();
  const userId = session?.userId || (await prisma.user.findFirst({ where: { role: "CUSTOMER" } }))?.id;

  const orders = userId
    ? await prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
          deliverySlot: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#2d6a4f] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-900">My Orders</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c2421] tracking-tight">
            My Produce Orders
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track active deliveries, assigned circular crates, and view invoices.
          </p>
        </div>

        <Link
          href="/vegetables"
          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          Shop More Produce
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e3d9] p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-base text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Discover today&apos;s fresh morning harvest from verified local farms.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#e8e3d9] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#1c2421]">{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-[#d8f3dc] text-[#1b4332]"
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-xs text-stone-500">
                  {order.items.length} items • Total: <strong className="text-stone-900">{formatPaise(order.totalPaise)}</strong> (Cash on Delivery)
                </div>

                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#2d6a4f]" /> Slot: {order.deliverySlot.name}
                </div>
              </div>

              <Link
                href={`/account/orders/${order.id}`}
                className="bg-[#fbf9f5] border border-[#e8e3d9] hover:border-[#2d6a4f] text-[#2d6a4f] text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Track & View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import React from "react";
import { getAdminSession } from "@/core/security/auth";
import { AdminSidebar } from "@/shared/components/admin/AdminSidebar";
import { AdminTopNav } from "@/shared/components/admin/AdminTopNav";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Unauthenticated shell (renders login screen cleanly without sidebar)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex text-stone-800 antialiased font-sans">
      {/* Cloned Sidebar from Reference Image */}
      <AdminSidebar
        adminName={session.name}
        adminEmail={session.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cloned Top Header Bar */}
        <AdminTopNav adminName={session.name} />

        {/* Dashboard Page Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

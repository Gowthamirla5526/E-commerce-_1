import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { CartProvider } from "@/shared/context/CartContext";
import { LanguageProvider } from "@/core/i18n/LanguageContext";
import { CartDrawer } from "@/shared/components/cart/CartDrawer";
import { MobileNav } from "@/shared/components/layout/MobileNav";
import { NetworkStatusIndicator } from "@/shared/components/layout/NetworkStatusIndicator";
import { ServiceWorkerRegister } from "@/shared/components/pwa/ServiceWorkerRegister";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1b4332",
};

export const metadata: Metadata = {
  title: "Fresh Harvest | Next-Generation Perishable Produce Commerce",
  description:
    "Commercial e-commerce platform dedicated exclusively to fresh fruits and vegetables. Featuring Freshness Matchmaker, My Fridge Intelligence, Seven-Day Meal Planning, and Community Harvest Drops.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  keywords: [
    "fresh fruits",
    "fresh vegetables",
    "Bangalore vegetables online",
    "freshness matchmaker",
    "community harvest",
    "farm to table",
    "reusable crates",
  ],
  authors: [{ name: "Fresh Harvest Produce Co." }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#fbf9f5] text-[#1c2421] antialiased pb-16 md:pb-0">
        <ServiceWorkerRegister />
        <NetworkStatusIndicator />
        <LanguageProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <CartDrawer />
            <MobileNav />
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

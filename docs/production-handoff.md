# FRESH HARVEST — MASTER PRODUCTION HAND-OFF & ARCHITECTURAL SPECIFICATION
**Next-Generation Fruits & Vegetables Perishable Produce Platform**
*Version 3.0 • Production Ready*

---

## 1. Executive Summary & Platform Identity

**Fresh Harvest** is a commercial, production-grade e-commerce platform built exclusively for fresh fruits and vegetables. It rejects generic grocery catalog templates in favor of a specialized produce intelligence engine combining:

1. **Produce Exclusivity**: 100% fruits and vegetables. Zero dry groceries, FMCG, or packaged staples.
2. **Perishable Life-Cycle Architecture**: Batch-level FEFO (First-Expired, First-Out) darkstore inventory tracking, readiness stage monitoring (`READY_TO_EAT`, `TURNING`, `RIPENING`, `RAW_FOR_COOKING`), and GI-tagged origin heritage.
3. **Strict Mathematical Integrity**: Zero IEEE-754 floating-point errors. All currencies stored in **INR Paise** (1 INR = 100 Paise), all produce quantities stored in **integer Grams**.
4. **Payment Constraint Adherence**: **Cash on Delivery (Pay with Cash / UPI at Doorstep)** is the exclusive checkout payment mechanism. No third-party online payment gateways are linked.
5. **Zero-Waste Circular Logistics**: Returnable ventilated crates with encrypted QR tokens and refundable deposits (₹50 / crate) eliminating single-use plastic.

---

## 2. Technology Stack & System Architecture

```mermaid
flowchart TD
    Client["Browser / Mobile PWA (React 19, Tailwind CSS v4)"]
    SW["Service Worker (Cache-First Assets, Stale-While-Revalidate Catalog)"]
    IDB["IndexedDB + LocalStorage Dual-Persistence Cart"]
    
    Next["Next.js 15 App Router (Route Handlers & React Server Components)"]
    Auth["Session Guards (httpOnly Cookies, Role-Based Access)"]
    Zod["Zod Validation & Business Services Layer"]
    
    Prisma["Prisma ORM (45 Relational Models)"]
    DB[("Relational Database (PostgreSQL / SQLite Development)")]
    Darkstore["Darkstore Hub BLR-INDIRANAGAR-01"]
    
    Client --> SW
    Client --> IDB
    Client --> Next
    Next --> Auth
    Auth --> Zod
    Zod --> Prisma
    Prisma --> DB
    Next -.-> Darkstore
```

- **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript (Strict Mode).
- **Styling**: Tailwind CSS v4 with custom produce theme palette (`#1b4332`, `#2d6a4f`, `#52b788`, `#fbf9f5`).
- **Icons & Visuals**: Lucide React + custom SVG PWA iconography.
- **Data Engine**: Prisma ORM with relational modeling, foreign key constraints, and unique compound indexes.
- **Client Persistence**: IndexedDB (`FreshHarvestProduceDB`) + `localStorage` dual-layer persistence fallback.
- **PWA & Offline**: Multi-tier Service Worker (`public/sw.js`), Web App Manifest (`src/app/manifest.ts`), and dedicated offline fallback (`/offline`).
- **Testing**: Native Node.js / Prisma acceptance test suites (`phase6-acceptance.js`, `phase7-acceptance.js`, `phase8-acceptance.js`, `phase9-production-acceptance.js`).

---

## 3. The Nine Signature Differentiating Features

| # | Signature Feature | Customer Route | Admin Route | Key API Endpoints | Business Logic & Integrity Rules |
|---|---|---|---|---|---|
| 1 | **Freshness Matchmaker** | `/matchmaker` | `/admin/inventory` | `/api/v1/matchmaker/recommend` | Maps customer intended consumption timeline (`TODAY`, `TOMORROW`, `IN_2_3_DAYS`, `WEEKEND`) and culinary use (`EATING_FRESH`, `COOKING`) to batches matching physical ripeness stages. |
| 2 | **My Fridge Intelligence** | `/fridge` | — | `/api/v1/fridge/items`, `/api/v1/fridge/items/[id]` | Tracks household produce inventory, estimated shelf-life days, crisper/countertop storage advice, and emits duplicate-purchase warnings. |
| 3 | **Seven-Day Fresh Plan** | `/fresh-plan` | — | `/api/v1/fresh-plan/generate` | Generates a 7-day meal schedule from curated Indian regional produce recipes, itemizing produce shopping requirements stock-aware. |
| 4 | **My Perfect Pick** | `/perfect-pick` | `/admin/fulfillment` | `/api/v1/perfect-pick/preferences` | Persists fine-grained picking criteria (Ripeness: `TURNING`/`READY_TO_EAT`; Firmness: `CRISP`/`SOFT`; Size: `MEDIUM`/`LARGE`) stamped directly on darkstore packing slips. |
| 5 | **Regional Produce Explorer** | `/regional` | `/admin/catalog` | `/api/v1/regional/varieties` | Geographical directory of authentic GI-tagged and regional varieties (*Devgad Alphonso*, *Mysuru Yelakki*, *Kolar Tomatoes*, *Nilgiri Carrots*). |
| 6 | **Batch Guardian** | Post-delivery feedback | `/admin/quality` | `/api/v1/batch-guardian/feedback`, `/api/v1/admin/quality/alerts/resolve` | Connects customer defects to farm batches. Automatically quarantines batches on defect threshold breach (>= 2 complaints or `MOULD_ROT`). |
| 7 | **Community Harvest Drops** | `/harvest-drops` | `/admin/harvest-drops` | `/api/v1/harvest/campaigns`, `/api/v1/harvest/campaigns/[id]/join` | Neighbourhood collaborative purchasing. Pledges volume with zero online pre-payment (Cash on Delivery upon farm dispatch lock). |
| 8 | **Market Pulse Mandi Index** | `/market-pulse` | `/admin/market-pulse` | `/api/v1/market-pulse/trends`, `/api/v1/admin/market-pulse/update` | Full price transparency comparing retail prices vs official APMC wholesale Mandi benchmarks (Yeshwanthpur APMC) with 5-pillar cost breakdown. |
| 9 | **Return & Reuse Packaging** | `/packaging` | `/admin/packaging` | `/api/v1/packaging/ledger`, `/api/v1/packaging/schedule-pickup`, `/api/v1/admin/packaging/crates/return` | Zero single-use plastic. Ventilated circular crates tracked via QR tokens with ₹50 refundable deposits and 1-click doorstep collection scheduling. |

---

## 4. Concurrency Safety & Financial Precision

### Zero-Negative-Stock Concurrency Engine
To prevent overselling and race conditions when multiple customers check out concurrently, batch stock reservations utilize **atomic conditional updates**:

```typescript
// Optimistic Concurrency Control in Prisma Transaction
const updateResult = await tx.inventoryBatch.updateMany({
  where: {
    id: candidateBatch.id,
    availableQuantityGrams: { gte: requestedGrams },
    status: "ACTIVE",
  },
  data: {
    availableQuantityGrams: { decrement: requestedGrams },
    reservedQuantityGrams: { increment: requestedGrams },
  },
});

if (updateResult.count === 0) {
  // Batch was depleted by a concurrent request; rollover to next FEFO batch or fail safely
}
```
*Audit Result*: In automated stress testing (5 concurrent checkouts demanding 2,500g against a 1,000g stock batch), exactly 2 checkouts succeeded (1,000g allocated), 3 were rejected safely, and `availableQuantityGrams` reached exactly 0 without negative stock.

---

## 5. Security & Session Governance

1. **Authentication Architecture**:
   - **Admin Access**: Cookie-based session (`fresh_harvest_admin_token`) signed with HMAC secret. Guards all `/admin/*` views and `/api/v1/admin/*` mutations.
   - **Customer Access**: Session cookie (`fresh_harvest_customer_token`) managing customer identity, order history, and addresses.
2. **Data Isolation**:
   - Customer household fridge inventories and order records are strictly scoped by `userId`. Cross-tenant data access is impossible at the query layer.
3. **Payment Integrity**:
   - System strictly rejects online payment gateway integrations as mandated. Orders are created with `paymentStatus: "UNPAID"` and `paymentMethod: "CASH_ON_DELIVERY"`. Riders collect payment in cash or doorstep UPI.

---

## 6. Operational Runbook & Deployment Guide

### Environment Variables (`.env`)
```bash
DATABASE_URL="file:./dev.db" # Or postgresql://user:pass@host:5432/fresh_harvest
ADMIN_JWT_SECRET="fresh_harvest_super_secret_admin_jwt_key_2026_prod"
CUSTOMER_JWT_SECRET="fresh_harvest_super_secret_customer_jwt_key_2026_prod"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="production"
```

### Production Build & Execution
```bash
# 1. Apply database migrations
npx prisma db push

# 2. Compile optimized production build (All 51 routes prerendered)
npm run build

# 3. Start Next.js production server
npm run start
```

### Verification Test Suite
```bash
# Execute master end-to-end acceptance audit
node tests/phase9-production-acceptance.js
```

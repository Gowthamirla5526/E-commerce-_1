# Fresh Harvest 🥬

> **Next-Generation Commercial Perishable Produce E-Commerce Platform**

Fresh Harvest is a full-stack, enterprise-grade perishable produce e-commerce application built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Prisma ORM. Engineered specifically for farm-fresh fruits, daily vegetables, and leafy greens with zero general grocery or non-produce clutter.

---

## ✨ Features

- **100% Produce-Only Storefront**: Curated catalog of 62 verified farm-fresh SKUs across Fresh Fruits, Daily Vegetables, and Leafy Greens.
- **Strict Cash on Delivery**: Inspect farm produce at your doorstep before paying via Cash or dynamic UPI QR. Zero advance payment risk.
- **Single Main Branch Hub**: Consolidated darkstore operations routed through `Main Branch (MAIN-BLR-01)` in Bengaluru Central Core (Indiranagar / 560038).
- **Trilingual Localization**: Persistent language switching across **English (🇬🇧)**, **Hindi (🇮🇳 हिंदी)**, and **Kannada (🇮🇳 ಕನ್ನಡ)** with localized regional produce names (e.g. *Palak Soppu*, *Tondekai*, *Yelakki*).
- **Dynamic Product Cards**: Blue `BESTSELLER` tag, crisp rating badge, and instant `ADD` / stepper counter.
- **FEFO Batch Tracking**: First-Expired, First-Out batch allocation and ripeness tracking (*Ready to Eat*, *Turning*, *Peak*, *Raw*).
- **Returnable Crate Packaging**: Circular, food-grade reusable crates with transparent ₹100 deposit and return ledger.
- **Administration & Ops Portal**:
  - Main Branch business statements & AI report downloads (CSV).
  - Live inventory tracking: *Total Active Stock in the Shop* & *1 Main Branch*.
  - Order fulfillment pipeline: `CONFIRMED` ➔ `PICKING` ➔ `PACKED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
- **Flipkart-Grade Enterprise Security**:
  - Strict Content Security Policy (CSP), 2-year HSTS, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Permissions-Policy.
  - Sliding-window rate limiting on authentication routes.
  - Strict Role-Based Access Control (RBAC) enforced via Edge middleware.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) with SQLite (`dev.db`) / PostgreSQL support
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.18.0
- npm >= 9.0.0

### 2. Clone & Install
```bash
git clone https://github.com/Gowthamirla5526/E-commerce-_1.git
cd E-commerce-_1
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

### 4. Database Setup & Seed
```bash
npx prisma generate
npx prisma db push
node prisma/seed-all-produce.js
```

### 5. Run Locally
```bash
# Development mode
npm run dev

# Or build & start production server
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run comprehensive automated test suites:

```bash
# Role-based access control security suite (9 scenarios)
node tests/rbac-acceptance.js

# End-to-end customer flow & button test (47 scenarios)
node tests/comprehensive-website-flow-test.js

# Backend speed, latency & error audit
node tests/backend-speed-and-health-audit.js
```

---

## 📄 License
MIT License. © 2026 Fresh Harvest Co.

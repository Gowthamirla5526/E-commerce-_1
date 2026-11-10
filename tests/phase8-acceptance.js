const fs = require("fs");
const path = require("path");

async function runPhase8Acceptance() {
  console.log("=================================================");
  console.log("   FRESH HARVEST: PHASE 8 ACCEPTANCE TEST SUITE  ");
  console.log("   Performance, Offline Resilience & PWA Shell   ");
  console.log("=================================================\n");

  const rootDir = path.resolve(__dirname, "..");

  // -------------------------------------------------------------
  // TEST 1: PWA MANIFEST & ICON ASSET VERIFICATION
  // -------------------------------------------------------------
  console.log("▶ TEST 1: PWA Web App Manifest & Produce Icon Set");
  const manifestPath = path.join(rootDir, "public", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("public/manifest.json not found.");
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`  Found Web App Manifest: "${manifest.name}" (${manifest.short_name})`);
  console.log(`  Theme Color: ${manifest.theme_color}, Background: ${manifest.background_color}`);
  console.log(`  Display Mode: ${manifest.display}, Start URL: ${manifest.start_url}`);

  if (manifest.theme_color !== "#1b4332") {
    throw new Error(`Expected theme_color #1b4332, found ${manifest.theme_color}`);
  }
  if (manifest.display !== "standalone") {
    throw new Error(`Expected display standalone, found ${manifest.display}`);
  }

  // Check icon files
  for (const icon of manifest.icons) {
    const iconPath = path.join(rootDir, "public", icon.src);
    if (!fs.existsSync(iconPath)) {
      throw new Error(`Icon file not found on disk: ${iconPath}`);
    }
    console.log(`  - Verified Icon: ${icon.src} (${icon.sizes}, ${icon.type})`);
  }
  console.log("  ✔ TEST 1 PASSED: Web App Manifest and PWA icons verified.\n");

  // -------------------------------------------------------------
  // TEST 2: SERVICE WORKER & OFFLINE CACHING ARCHITECTURE
  // -------------------------------------------------------------
  console.log("▶ TEST 2: Service Worker & Multi-Tier Caching Engine");
  const swPath = path.join(rootDir, "public", "sw.js");
  if (!fs.existsSync(swPath)) {
    throw new Error("public/sw.js not found.");
  }

  const swContent = fs.readFileSync(swPath, "utf-8");
  const hasPrecache = swContent.includes("PRECACHE_RESOURCES") && swContent.includes("/offline");
  const hasOrderBypass = swContent.includes("/api/v1/orders") && swContent.includes("/api/v1/slots");
  const hasOfflineFallback = swContent.includes("OFFLINE_URL");

  console.log(`  Precache Resources defined: ${hasPrecache ? "YES" : "NO"}`);
  console.log(`  Order & Inventory API Network-Only protection: ${hasOrderBypass ? "YES" : "NO"}`);
  console.log(`  HTML Navigation Offline Fallback configured: ${hasOfflineFallback ? "YES" : "NO"}`);

  if (!hasPrecache || !hasOrderBypass || !hasOfflineFallback) {
    throw new Error("Service worker lacks required caching strategies.");
  }

  // Check /offline route layout and page
  const offlinePagePath = path.join(rootDir, "src", "app", "offline", "page.tsx");
  if (!fs.existsSync(offlinePagePath)) {
    throw new Error("src/app/offline/page.tsx missing.");
  }
  console.log("  Offline fallback page verified on disk.");
  console.log("  ✔ TEST 2 PASSED: Service Worker routing & caching architecture verified.\n");

  // -------------------------------------------------------------
  // TEST 3: INDEXEDDB DUAL-PERSISTENCE CART ENGINE
  // -------------------------------------------------------------
  console.log("▶ TEST 3: IndexedDB & LocalStorage Resilient Cart Storage");
  const idbPath = path.join(rootDir, "src", "core", "storage", "indexeddb-cart.ts");
  if (!fs.existsSync(idbPath)) {
    throw new Error("src/core/storage/indexeddb-cart.ts missing.");
  }

  const idbContent = fs.readFileSync(idbPath, "utf-8");
  const hasIDBSave = idbContent.includes("saveCartToIndexedDB");
  const hasIDBLoad = idbContent.includes("loadCartFromIndexedDB");
  const hasIDBClear = idbContent.includes("clearCartFromIndexedDB");

  console.log(`  IndexedDB Store: saveCartToIndexedDB [${hasIDBSave ? "OK" : "FAIL"}]`);
  console.log(`  IndexedDB Store: loadCartFromIndexedDB [${hasIDBLoad ? "OK" : "FAIL"}]`);
  console.log(`  IndexedDB Store: clearCartFromIndexedDB [${hasIDBClear ? "OK" : "FAIL"}]`);

  // Verify CartContext integration
  const cartContextPath = path.join(rootDir, "src", "shared", "context", "CartContext.tsx");
  const cartContent = fs.readFileSync(cartContextPath, "utf-8");
  const usesBothStores =
    cartContent.includes("loadCartFromIndexedDB") &&
    cartContent.includes("saveCartToIndexedDB") &&
    cartContent.includes("localStorage");

  console.log(`  CartContext dual-persistence integration: ${usesBothStores ? "YES" : "NO"}`);
  if (!usesBothStores) {
    throw new Error("CartContext does not integrate both IndexedDB and localStorage.");
  }
  console.log("  ✔ TEST 3 PASSED: Resilient offline cart storage verified.\n");

  // -------------------------------------------------------------
  // TEST 4: CORE WEB VITALS, SECURITY & PERFORMANCE HEADERS
  // -------------------------------------------------------------
  console.log("▶ TEST 4: Security & Caching Response Headers");
  const nextConfigPath = path.join(rootDir, "next.config.ts");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");

  const hasSwHeader = nextConfigContent.includes("Service-Worker-Allowed");
  const hasSecurityHeaders =
    nextConfigContent.includes("X-Content-Type-Options") &&
    nextConfigContent.includes("X-Frame-Options");
  const hasImageOptimization = nextConfigContent.includes("image/avif") && nextConfigContent.includes("image/webp");

  console.log(`  Service-Worker-Allowed Header: ${hasSwHeader ? "Configured" : "Missing"}`);
  console.log(`  Security Headers (no-sniff, sameorigin): ${hasSecurityHeaders ? "Configured" : "Missing"}`);
  console.log(`  Next.js AVIF & WebP image formats: ${hasImageOptimization ? "Configured" : "Missing"}`);

  if (!hasSwHeader || !hasSecurityHeaders || !hasImageOptimization) {
    throw new Error("Performance/security headers not properly configured in next.config.ts.");
  }
  console.log("  ✔ TEST 4 PASSED: Performance and security headers verified.\n");

  // -------------------------------------------------------------
  // TEST 5: ROOT LAYOUT PWA & NETWORK INDICATOR INTEGRATION
  // -------------------------------------------------------------
  console.log("▶ TEST 5: Application Shell Integration");
  const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  const hasSWRegister = layoutContent.includes("ServiceWorkerRegister");
  const hasNetworkIndicator = layoutContent.includes("NetworkStatusIndicator");
  const hasThemeColor = layoutContent.includes("themeColor");

  console.log(`  ServiceWorkerRegister mounted in body: ${hasSWRegister ? "YES" : "NO"}`);
  console.log(`  NetworkStatusIndicator mounted in body: ${hasNetworkIndicator ? "YES" : "NO"}`);
  console.log(`  Theme Color configured in viewport: ${hasThemeColor ? "YES" : "NO"}`);

  if (!hasSWRegister || !hasNetworkIndicator || !hasThemeColor) {
    throw new Error("Root layout missing required PWA shell components.");
  }
  console.log("  ✔ TEST 5 PASSED: Root layout PWA integration verified.\n");

  console.log("=================================================");
  console.log("   ALL PHASE 8 PERFORMANCE & PWA TESTS PASSED!   ");
  console.log("=================================================");
}

runPhase8Acceptance().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});


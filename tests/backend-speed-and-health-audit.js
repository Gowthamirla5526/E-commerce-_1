const http = require("http");

const BASE_HOST = "localhost";
const BASE_PORT = 3000;

function timedRequest(path, headers = {}) {
  return new Promise((resolve) => {
    const start = process.hrtime();
    const req = http.request(
      {
        hostname: BASE_HOST,
        port: BASE_PORT,
        path,
        method: "GET",
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const diff = process.hrtime(start);
          const durationMs = Math.round(diff[0] * 1000 + diff[1] / 1e6);
          resolve({
            path,
            statusCode: res.statusCode,
            durationMs,
            contentLength: data.length,
          });
        });
      }
    );
    req.on("error", (err) => {
      resolve({ path, statusCode: 0, durationMs: -1, error: err.message });
    });
    req.end();
  });
}

async function runSpeedAndHealthAudit() {
  console.log("================================================================================");
  console.log("        FRESH HARVEST: BACKEND SPEED, LATENCY & ERROR AUDIT                     ");
  console.log("================================================================================\n");

  // Login as admin and customer first to test authenticated routes
  const adminLoginReq = http.request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: "/api/v1/auth/admin-login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  let adminCookie = "";
  await new Promise((resolve) => {
    adminLoginReq.on("response", (res) => {
      adminCookie = res.headers["set-cookie"]?.[0] || "";
      resolve();
    });
    adminLoginReq.write(JSON.stringify({ email: "admin@freshharvest.co.in", password: "Password123!" }));
    adminLoginReq.end();
  });

  const routesToTest = [
    // 1. Core Storefront Pages
    { path: "/", auth: "none" },
    { path: "/fruits", auth: "none" },
    { path: "/vegetables", auth: "none" },
    { path: "/leafy", auth: "none" },
    { path: "/seasonal", auth: "none" },
    { path: "/regional", auth: "none" },
    { path: "/cart", auth: "none" },
    { path: "/search?q=banana", auth: "none" },
    { path: "/product/kolar-vine-ripened-tomatoes", auth: "none" },
    { path: "/product/mysuru-yelakki-banana", auth: "none" },
    { path: "/legal/terms", auth: "none" },
    { path: "/legal/delivery-policy", auth: "none" },
    { path: "/legal/refund-policy", auth: "none" },
    { path: "/legal/packaging-policy", auth: "none" },
    { path: "/legal/privacy", auth: "none" },

    // 2. High-Traffic APIs
    { path: "/api/v1/auth/me", auth: "none" },
    { path: "/api/v1/slots/available?pincode=560038", auth: "none" },
    { path: "/api/v1/market-pulse/trends", auth: "none" },
    { path: "/api/v1/regional/varieties", auth: "none" },
    { path: "/api/v1/packaging/ledger", auth: "none" },

    // 3. Admin Operational Dashboards (Authenticated)
    { path: "/admin/dashboard", auth: "admin" },
    { path: "/admin/inventory", auth: "admin" },
    { path: "/admin/orders", auth: "admin" },
    { path: "/admin/customers", auth: "admin" },
    { path: "/admin/fulfillment", auth: "admin" },
    { path: "/admin/harvest-drops", auth: "admin" },
    { path: "/admin/market-pulse", auth: "admin" },
    { path: "/admin/quality", auth: "admin" },
    { path: "/admin/packaging", auth: "admin" },
    { path: "/admin/suppliers", auth: "admin" },
    { path: "/admin/catalog", auth: "admin" },
    { path: "/api/v1/admin/reports/download?period=day", auth: "admin" },
    { path: "/api/v1/admin/fulfillment/tasks", auth: "admin" },
  ];

  console.log("Auditing", routesToTest.length, "key customer and operational routes for speed & status...\n");

  let totalDuration = 0;
  let slowRoutes = [];
  let errorRoutes = [];

  for (const item of routesToTest) {
    const headers = {};
    if (item.auth === "admin") headers["Cookie"] = adminCookie;

    const res = await timedRequest(item.path, headers);
    totalDuration += res.durationMs;

    const speedBadge = res.durationMs < 50 ? "⚡ FAST" : res.durationMs < 150 ? "✔ OK" : "⚠ SLOW";
    const statusOk = res.statusCode === 200;

    if (!statusOk) {
      errorRoutes.push(res);
      console.log(`  ✘ [${res.statusCode}] ${item.path} - ${res.durationMs}ms`);
    } else {
      console.log(`  ✔ [${res.statusCode}] ${item.path.padEnd(46)} | ${String(res.durationMs).padStart(3)}ms | ${speedBadge}`);
    }

    if (res.durationMs > 200) {
      slowRoutes.push(res);
    }
  }

  const avgSpeed = Math.round(totalDuration / routesToTest.length);

  console.log("\n================================================================================");
  console.log("                          AUDIT RESULTS SUMMARY                                 ");
  console.log("================================================================================");
  console.log(`Total Routes Audited:   ${routesToTest.length}`);
  console.log(`HTTP 200 Success Rate:  ${((routesToTest.length - errorRoutes.length) / routesToTest.length * 100).toFixed(1)}%`);
  console.log(`Average Latency:        ${avgSpeed} ms per request`);
  console.log(`Slow Routes (>200ms):   ${slowRoutes.length}`);
  console.log(`Error Routes (Non-200): ${errorRoutes.length}`);

  if (errorRoutes.length > 0) {
    console.log("\nERRORS DETECTED:");
    for (const e of errorRoutes) {
      console.log(`  - Path: ${e.path} returned status ${e.statusCode}`);
    }
    process.exit(1);
  } else {
    console.log("\n✔ ZERO ERRORS DETECTED: Every audited route returned clean HTTP 200 OK!");
  }
}

runSpeedAndHealthAudit();


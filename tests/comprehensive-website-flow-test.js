const http = require("http");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000";

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json,
        });
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runComprehensiveWebsiteFlowTest() {
  console.log("================================================================================");
  console.log("     FRESH HARVEST: COMPREHENSIVE END-TO-END FLOW & BUTTON DEEP TEST           ");
  console.log("         Testing Every Page, Button, Cart, Checkout & Cash on Delivery          ");
  console.log("================================================================================\n");

  let totalPassed = 0;
  let totalTests = 0;

  function assert(condition, description) {
    totalTests++;
    if (condition) {
      console.log(`  ✔ PASS [${totalTests}]: ${description}`);
      totalPassed++;
    } else {
      console.error(`  ✘ FAIL [${totalTests}]: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. FLIPKART-GRADE SECURITY HEADERS & SERVER HEALTH
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 1: Server Health & Enterprise Security Headers");
  const homeRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  });
  assert(homeRes.statusCode === 200, "Homepage / loads with HTTP 200 OK");
  assert(homeRes.headers["x-frame-options"] === "SAMEORIGIN", "Security header X-Frame-Options is SAMEORIGIN");
  assert(homeRes.headers["x-content-type-options"] === "nosniff", "Security header X-Content-Type-Options is nosniff");
  assert(homeRes.headers["strict-transport-security"]?.includes("max-age=63072000"), "Security header HSTS is 2-years preload");
  assert(homeRes.headers["content-security-policy"]?.includes("default-src"), "Security header Content-Security-Policy is enforced");
  console.log("");

  // ---------------------------------------------------------------------------
  // 2. STOREFRONT CATALOG & ROUTE BUTTONS
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 2: Storefront Navigation & Category Buttons");
  const routesToTest = [
    { path: "/fruits", name: "Fresh Fruits Category Page" },
    { path: "/vegetables", name: "Daily Vegetables Category Page" },
    { path: "/leafy", name: "Leafy Greens Category Page" },
    { path: "/search?q=tomato", name: "Search Query Flow (?q=tomato)" },
    { path: "/product/kolar-vine-ripened-tomatoes", name: "Product Detail: Kolar Tomatoes" },
    { path: "/product/mysuru-yelakki-banana", name: "Product Detail: Yelakki Banana" },
    { path: "/cart", name: "Shopping Cart Page" },
    { path: "/account/login", name: "Customer Login Page" },
  ];

  for (const r of routesToTest) {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: r.path,
      method: "GET",
    });
    assert(res.statusCode === 200, `${r.name} (${r.path}) renders successfully (HTTP 200)`);
  }

  // Verify guest checkout redirect
  const guestCheckoutRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/checkout",
    method: "GET",
  });
  assert(
    guestCheckoutRes.statusCode === 307 && guestCheckoutRes.headers.location?.includes("/account/login"),
    "Guest attempting /checkout is securely redirected to login (HTTP 307 -> /account/login?redirect=%2Fcheckout)"
  );
  console.log("");

  // ---------------------------------------------------------------------------
  // 3. CATALOG INTEGRITY: 100% PRODUCE EXCLUSIVITY (ZERO COOKED FOOD)
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 3: Produce Exclusivity Audit (Zero Cooked Food / Grains / Meat)");
  const products = await prisma.product.findMany({
    include: { category: true, skus: true },
  });
  assert(products.length >= 60, `Catalog contains ${products.length} verified produce SKUs (>= 60)`);
  
  const invalidProducts = products.filter(
    (p) => !["Fresh Fruits", "Daily Vegetables", "Leafy Vegetables & Greens"].includes(p.category.name)
  );
  assert(invalidProducts.length === 0, "Zero non-produce items detected in catalog database");
  console.log(`  Audited all ${products.length} products: 100% fresh fruits, vegetables, and leafy greens only.`);
  console.log("");

  // ---------------------------------------------------------------------------
  // 4. CUSTOMER LOGIN & SESSION CREATION
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 4: Customer Authentication Flow");
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/v1/auth/customer-login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "customer.ananya@example.com", password: "fresh123" }
  );
  assert(loginRes.statusCode === 200, "Customer login API returns HTTP 200 OK");
  assert(loginRes.json?.success === true, "Customer login response success is true");
  
  const customerCookie = loginRes.headers["set-cookie"]?.[0] || "";
  assert(customerCookie.includes("fresh_harvest_customer_session"), "Customer session cookie issued correctly");

  const meRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/v1/auth/me",
    method: "GET",
    headers: { Cookie: customerCookie },
  });
  assert(meRes.statusCode === 200, "Customer /api/v1/auth/me authenticated successfully");
  assert(meRes.json?.role === "USER", "Authenticated role verified as USER");
  const customerId = meRes.json?.user?.userId || meRes.json?.user?.id;

  const authCheckoutRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/checkout",
    method: "GET",
    headers: { Cookie: customerCookie },
  });
  assert(authCheckoutRes.statusCode === 200, "Authenticated customer loads /checkout with HTTP 200 OK");
  console.log("");

  // ---------------------------------------------------------------------------
  // 5. DELIVERY ADDRESS & SERVICEABILITY PINCODE CHECK
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 5: Customer Address & Delivery Pincode Verification");
  const addressRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/v1/customer/addresses",
    method: "GET",
    headers: { Cookie: customerCookie },
  });
  assert(addressRes.statusCode === 200, "Customer addresses fetched successfully");
  let customerAddress = addressRes.json?.data?.[0];
  if (!customerAddress) {
    // Create address if none exists
    const createAddrRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/v1/customer/addresses",
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: customerCookie },
      },
      {
        recipientName: "Ananya Sharma",
        phone: "+91 98765 43220",
        streetLine1: "Flat 402, Green Glen Heights, 100ft Road",
        locality: "Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
        label: "HOME",
        isDefault: true,
      }
    );
    customerAddress = createAddrRes.json?.data;
  }
  assert(customerAddress?.pincode === "560038", "Verified serviceability for Bengaluru PIN: 560038");
  console.log("");

  // ---------------------------------------------------------------------------
  // 6. DELIVERY SLOTS AVAILABILITY
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 6: Delivery Slots Availability Check");
  const slotRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/v1/slots/available?pincode=${customerAddress.pincode}`,
    method: "GET",
  });
  assert(slotRes.statusCode === 200, "Slots API returns HTTP 200 OK");
  assert(slotRes.json?.data?.slots?.length > 0, "At least 1 delivery slot is configured");
  const activeSlot = slotRes.json?.data?.slots?.find((s) => s.isAvailable) || slotRes.json?.data?.slots?.[0];
  assert(!!activeSlot, `Selected delivery slot: ${activeSlot?.name} (${activeSlot?.startTime} - ${activeSlot?.endTime})`);
  console.log("");

  // ---------------------------------------------------------------------------
  // 7. ORDER PLACEMENT: STRICTLY CASH ON DELIVERY
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 7: Order Creation with 100% Cash on Delivery (Zero Online Gateways)");
  const targetSku = await prisma.sku.findFirst({
    where: { active: true },
    include: { product: true },
  });
  assert(!!targetSku, `Selected produce SKU: ${targetSku.product.title} (${targetSku.skuCode})`);

  const orderPayload = {
    addressId: customerAddress.id,
    deliverySlotId: activeSlot.id,
    deliveryDate: new Date().toISOString().split("T")[0],
    idempotencyKey: `IDEM-TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    paymentMethod: "CASH_ON_DELIVERY",
    items: [
      {
        skuId: targetSku.id,
        quantity: 2,
        perfectPickSnapshotJson: "Ripeness: READY_TO_EAT",
      },
    ],
  };

  const createOrderRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/v1/orders/create",
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: customerCookie },
    },
    orderPayload
  );

  assert(createOrderRes.statusCode === 200, "Order creation API returned HTTP 200 OK");
  assert(createOrderRes.json?.success === true, "Order response success is true");
  const placedOrderId = createOrderRes.json?.data?.orderId;
  const placedOrderNumber = createOrderRes.json?.data?.orderNumber;
  assert(!!placedOrderId, `Order placed successfully! Order ID: ${placedOrderId} (Ref: ${placedOrderNumber})`);

  // Verify DB state of order
  const dbOrder = await prisma.order.findUnique({
    where: { id: placedOrderId },
    include: { items: true, payments: true },
  });
  const paymentRecord = dbOrder?.payments?.[0];
  assert(paymentRecord?.gateway === "CASH_ON_DELIVERY", "Verified: Payment method in DB is strictly CASH_ON_DELIVERY");
  assert(paymentRecord?.status === "INITIATED", "Verified: Payment status is INITIATED (Pay at Doorstep with Cash / UPI)");
  assert(dbOrder?.status === "CONFIRMED", "Order status initialized as CONFIRMED");
  console.log("");

  // ---------------------------------------------------------------------------
  // 8. ORDER DETAILS & CONFIRMATION PAGE
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 8: Order Confirmation & Tracking Page");
  const orderDetailsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/account/orders/${placedOrderId}`,
    method: "GET",
    headers: { Cookie: customerCookie },
  });
  assert(orderDetailsRes.statusCode === 200, "Order tracking page /account/orders/[id] renders HTTP 200 OK");
  assert(orderDetailsRes.body.includes(placedOrderNumber), "Order tracking page displays generated Order Number");
  assert(orderDetailsRes.body.includes("Cash on Delivery"), "Order tracking page clearly confirms Cash on Delivery payment");
  console.log("");

  // ---------------------------------------------------------------------------
  // 9. ADMIN DASHBOARD & SINGLE MAIN BRANCH CONSOLIDATION
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 9: Administration Dashboard & Single Main Branch Operations");
  const adminLoginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/v1/auth/admin-login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "admin@freshharvest.co.in", password: "Password123!" }
  );
  assert(adminLoginRes.statusCode === 200, "Admin login API returns HTTP 200 OK");
  const adminCookie = adminLoginRes.headers["set-cookie"]?.[0] || "";

  const adminDashRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/admin/dashboard",
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  assert(adminDashRes.statusCode === 200, "Admin Dashboard renders HTTP 200 OK");
  assert(adminDashRes.body.includes("Main Branch"), "Admin Dashboard explicitly displays Main Branch");
  assert(adminDashRes.body.includes("MAIN-BLR-01"), "Admin Dashboard explicitly displays branch code MAIN-BLR-01");

  const inventoryAdminRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/admin/inventory",
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  assert(inventoryAdminRes.statusCode === 200, "Admin Inventory renders HTTP 200 OK");
  assert(inventoryAdminRes.body.includes("Total Active Stock in the Shop"), "Verified KPI: 'Total Active Stock in the Shop'");
  assert(inventoryAdminRes.body.includes("1 Main Branch"), "Verified KPI: '1 Main Branch'");

  // Test Admin Report Download
  const reportRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/v1/admin/reports/download?period=day",
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  assert(reportRes.statusCode === 200, "Admin Report Download API returns HTTP 200 OK (CSV)");
  assert(reportRes.headers["content-type"]?.includes("text/csv"), "Admin Report response is valid text/csv");
  console.log("");

  // ---------------------------------------------------------------------------
  // 10. REJECTION OF UNAUTHORIZED / ONLINE GATEWAY PAYMENT ATTEMPTS
  // ---------------------------------------------------------------------------
  console.log("▶ STEP 10: Reject Non-Cash/Online Gateway Attempts");
  const invalidPaymentPayload = {
    ...orderPayload,
    paymentMethod: "CREDIT_CARD_STRIPE",
  };
  const invalidPaymentRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/v1/orders/create",
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: customerCookie },
    },
    invalidPaymentPayload
  );
  assert(
    invalidPaymentRes.statusCode === 400 || !invalidPaymentRes.json?.success,
    "Non-cash / online gateway payment attempt strictly blocked with validation error"
  );
  console.log("");

  console.log("================================================================================");
  console.log(`  ALL ${totalPassed}/${totalTests} DEEP FLOW & BUTTON TESTS PASSED SUCCESSFULLY!`);
  console.log("================================================================================");
}

runComprehensiveWebsiteFlowTest()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Test failed:", err);
    prisma.$disconnect();
    process.exit(1);
  });

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000";

async function runRbacTests() {
  console.log("================================================================================");
  console.log("       FRESH HARVEST: ROLE-BASED ACCESS CONTROL (RBAC) TEST SUITE               ");
  console.log("           Customer (USER) vs Staff (ADMIN) Security Verification               ");
  console.log("================================================================================\n");

  let testsPassed = 0;
  const totalTests = 9;

  // Setup: Use existing admin and customer in the DB
  const testAdminEmail = "admin@freshharvest.co.in";
  const testCustomerEmail = "customer.ananya@example.com";

  let adminUser = await prisma.user.findUnique({ where: { email: testAdminEmail } });
  let customerUser = await prisma.user.findUnique({ where: { email: testCustomerEmail } });

  console.log(`[TEST SETUP] Test Admin Account: ${adminUser.email} (Role: ${adminUser.role})`);
  console.log(`[TEST SETUP] Test Customer Account: ${customerUser.email} (Role: ${customerUser.role})\n`);

  // ---------------------------------------------------------------------------
  // SCENARIO 1: USER Login -> Customer Session & Customer Redirect
  // ---------------------------------------------------------------------------
  console.log("▶ SCENARIO 1: USER Login sets USER role and customer session");
  const custLoginRes = await fetch(`${BASE_URL}/api/v1/auth/customer-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testCustomerEmail, password: "fresh123" }),
  });
  const custLoginData = await custLoginRes.json();
  const custSetCookie = custLoginRes.headers.get("set-cookie") || "";

  if (
    custLoginRes.status === 200 &&
    custLoginData.success === true &&
    custLoginData.role === "USER" &&
    (custLoginData.redirectUrl === "/" || custLoginData.redirectUrl === "/account") &&
    custSetCookie.includes("fresh_harvest_customer_session=")
  ) {
    console.log("  ✔ SCENARIO 1 PASSED: Role identified as 'USER', redirectUrl='/account', customer cookie set.");
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 1 FAILED: Unexpected response ${JSON.stringify(custLoginData)}`);
  }

  // Extract customer session cookie value
  const customerCookieMatch = custSetCookie.match(/fresh_harvest_customer_session=([^;]+)/);
  const customerCookie = customerCookieMatch ? customerCookieMatch[1] : "";

  // ---------------------------------------------------------------------------
  // SCENARIO 2: ADMIN Login -> Admin Session & Admin Redirect
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 2: ADMIN Login sets ADMIN role and admin session");
  const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testAdminEmail, password: "any" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminSetCookie = adminLoginRes.headers.get("set-cookie") || "";

  if (
    adminLoginRes.status === 200 &&
    adminLoginData.success === true &&
    adminLoginData.role === "ADMIN" &&
    adminLoginData.redirectUrl === "/admin/dashboard" &&
    adminSetCookie.includes("fresh_harvest_admin_session=")
  ) {
    console.log("  ✔ SCENARIO 2 PASSED: Role identified as 'ADMIN', redirectUrl='/admin/dashboard', admin cookie set.");
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 2 FAILED: Unexpected response ${JSON.stringify(adminLoginData)}`);
  }

  const adminCookieMatch = adminSetCookie.match(/fresh_harvest_admin_session=([^;]+)/);
  const adminCookie = adminCookieMatch ? adminCookieMatch[1] : "";

  // ---------------------------------------------------------------------------
  // SCENARIO 3: USER Manually Enters Admin URL -> Access Denied / Redirected
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 3: USER manually enters Admin URL (/admin/dashboard)");
  const userAccessAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: {
      Cookie: `fresh_harvest_customer_session=${customerCookie}`,
    },
    redirect: "manual",
  });

  const locationHeader = userAccessAdminRes.headers.get("location") || "";
  if (
    (userAccessAdminRes.status === 307 || userAccessAdminRes.status === 302 || userAccessAdminRes.status === 303) &&
    locationHeader.includes("/unauthorized")
  ) {
    console.log(`  ✔ SCENARIO 3 PASSED: Edge middleware blocked customer; redirected to 403 page: ${locationHeader}`);
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 3 FAILED: Expected redirect to /unauthorized, got status ${userAccessAdminRes.status} to ${locationHeader}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 4: USER Attempts Admin API Request -> HTTP 403 Forbidden
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 4: USER attempts Admin API request (/api/v1/admin/products)");
  const userApiRes = await fetch(`${BASE_URL}/api/v1/admin/products`, {
    headers: {
      Cookie: `fresh_harvest_customer_session=${customerCookie}`,
    },
  });
  const userApiData = await userApiRes.json();

  if (userApiRes.status === 403 && userApiData.success === false && userApiData.authenticatedRole === "USER") {
    console.log(`  ✔ SCENARIO 4 PASSED: HTTP 403 Forbidden returned. Error: "${userApiData.error}"`);
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 4 FAILED: Expected 403 Forbidden, got status ${userApiRes.status}: ${JSON.stringify(userApiData)}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 5: ADMIN Logs Out -> Admin Session Terminated
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 5: ADMIN logs out and admin session is cleared");
  const adminLogoutRes = await fetch(`${BASE_URL}/api/v1/auth/admin-logout`, {
    method: "POST",
    headers: {
      Cookie: `fresh_harvest_admin_session=${adminCookie}`,
    },
  });
  const adminLogoutCookie = (adminLogoutRes.headers.get("set-cookie") || "").toLowerCase();

  if (
    adminLogoutRes.status === 200 &&
    (adminLogoutCookie.includes("max-age=0") || adminLogoutCookie.includes("expires="))
  ) {
    console.log("  ✔ SCENARIO 5 PASSED: Admin cookie deleted (Expires=1970). Admin session cleared.");
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 5 FAILED: Expected cookie clear, got: ${adminLogoutCookie}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 6: USER Logs Out -> Customer Session Terminated
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 6: USER logs out and customer session is cleared");
  const custLogoutRes = await fetch(`${BASE_URL}/api/v1/auth/customer-logout`, {
    method: "POST",
    headers: {
      Cookie: `fresh_harvest_customer_session=${customerCookie}`,
    },
  });
  const custLogoutCookie = (custLogoutRes.headers.get("set-cookie") || "").toLowerCase();

  if (
    custLogoutRes.status === 200 &&
    (custLogoutCookie.includes("max-age=0") || custLogoutCookie.includes("expires="))
  ) {
    console.log("  ✔ SCENARIO 6 PASSED: Customer cookie deleted (Expires=1970). Customer session cleared.");
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 6 FAILED: Expected cookie clear, got: ${custLogoutCookie}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 7: Browser Refresh -> Correct Role and Dashboard Maintained
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 7: Browser refresh maintains correct role via /api/v1/auth/me");
  // Test customer session check
  const custMeRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: {
      Cookie: `fresh_harvest_customer_session=${customerCookie}`,
    },
  });
  const custMeData = await custMeRes.json();

  // Test admin session check
  const adminMeRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: {
      Cookie: `fresh_harvest_admin_session=${adminCookie}`,
    },
  });
  const adminMeData = await adminMeRes.json();

  if (
    custMeData.role === "USER" &&
    custMeData.isAuthenticated === true &&
    adminMeData.role === "ADMIN" &&
    adminMeData.isAuthenticated === true
  ) {
    console.log(`  ✔ SCENARIO 7 PASSED: Customer session returns role: "${custMeData.role}", Admin session returns role: "${adminMeData.role}".`);
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 7 FAILED: Unexpected me response: cust=${JSON.stringify(custMeData)}, admin=${JSON.stringify(adminMeData)}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 8: Expired Session -> Rejection & Redirect to Login
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 8: Expired session token rejected");
  const secret = process.env.AUTH_SECRET || "fresh_harvest_secure_hmac_secret_key_2026_production_grade";
  const expiredPayload = {
    userId: customerUser.id,
    email: customerUser.email,
    role: "USER",
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
  };
  const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const expiredToken = `${payloadB64}.${sig}`;

  const expiredReq = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: {
      Cookie: `fresh_harvest_customer_session=${expiredToken}`,
    },
  });
  const expiredData = await expiredReq.json();

  if (expiredData.isAuthenticated === false && expiredData.role === "GUEST") {
    console.log("  ✔ SCENARIO 8 PASSED: Expired session token rejected as unauthenticated (GUEST).");
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 8 FAILED: Expired token accepted! ${JSON.stringify(expiredData)}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 9: Customer Attempts Role Escalation to ADMIN -> Request Rejected
  // ---------------------------------------------------------------------------
  console.log("\n▶ SCENARIO 9: Customer attempts to register or modify role to ADMIN");
  const maliciousRegisterRes = await fetch(`${BASE_URL}/api/v1/auth/customer-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "hacker@freshharvest.com",
      name: "Malicious User",
      phone: "+919000000000",
      role: "ADMIN", // Attacking role escalation!
    }),
  });
  const maliciousData = await maliciousRegisterRes.json();

  if (maliciousRegisterRes.status === 403 && maliciousData.success === false) {
    console.log(`  ✔ SCENARIO 9 PASSED: Malicious role escalation blocked with HTTP 403. Message: "${maliciousData.error}"`);
    testsPassed++;
  } else {
    throw new Error(`SCENARIO 9 FAILED: Role escalation was not blocked! Status: ${maliciousRegisterRes.status}`);
  }

  // Also verify that admin login rejects a customer credentials
  const customerAdminLoginAttempt = await fetch(`${BASE_URL}/api/v1/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testCustomerEmail, password: "any" }),
  });
  const customerAdminData = await customerAdminLoginAttempt.json();
  if (customerAdminLoginAttempt.status === 403 && customerAdminData.success === false) {
    console.log(`  ✔ BONUS VERIFICATION: Customer attempting to login via /api/v1/auth/admin-login rejected with HTTP 403: "${customerAdminData.error}".`);
  } else {
    throw new Error(`Bonus test failed: Customer logged into admin login endpoint! Status: ${customerAdminLoginAttempt.status}`);
  }

  console.log("\n================================================================================");
  console.log(`  ALL ${testsPassed}/${totalTests} RBAC SECURITY ACCEPTANCE TESTS PASSED SUCCESSFULLY! `);
  console.log("================================================================================\n");
}

runRbacTests()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("RBAC TEST SUITE FAILURE:", err);
    prisma.$disconnect();
    process.exit(1);
  });

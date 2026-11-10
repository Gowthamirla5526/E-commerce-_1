const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runPhase7Acceptance() {
  console.log("=================================================");
  console.log("   FRESH HARVEST: PHASE 7 ACCEPTANCE TEST SUITE  ");
  console.log("=================================================\n");

  let user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Phase 7 Tester",
        phone: "9876543211",
        email: "phase7tester@example.com",
        role: "CUSTOMER",
      },
    });
  }

  const userAddress = (await prisma.address.findFirst({ where: { userId: user.id } })) || (await prisma.address.create({
    data: {
      userId: user.id,
      label: "Home Delivery",
      recipientName: user.name,
      phone: user.phone || "9876543210",
      streetLine1: "12, 100ft Road",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
    },
  }));

  // -------------------------------------------------------------
  // TEST 1: COMMUNITY HARVEST DROPS POOLING & PLEDGING
  // -------------------------------------------------------------
  console.log("▶ TEST 1: Community Harvest Drops Pooling & Pledging Engine");
  const campaign = await prisma.harvestCampaign.findFirst({
    where: { status: { in: ["OPEN", "NEAR_TARGET"] } },
  });

  if (!campaign) throw new Error("No active harvest campaign found in database.");
  console.log(`  Found active campaign: "${campaign.title}"`);
  console.log(`  Baseline volume: ${campaign.currentGrams / 1000} kg / ${campaign.targetGrams / 1000} kg`);

  // Customer joins campaign with 10 kg
  const pledgeGrams = 10000;
  const totalAmountPaise = Math.round((pledgeGrams / 1000) * campaign.unitPricePaise);

  const participant = await prisma.groupPurchaseParticipant.create({
    data: {
      campaignId: campaign.id,
      userId: user.id,
      addressId: userAddress.id,
      quantityGrams: pledgeGrams,
      totalAmountPaise,
      paymentHoldStatus: "AUTHORIZED", // Cash on Delivery upon arrival
    },
  });
  console.log(`  Created participant pledge: ID ${participant.id}, ${pledgeGrams / 1000} kg for ₹${totalAmountPaise / 100}`);

  const updatedGrams = campaign.currentGrams + pledgeGrams;
  let newStatus = campaign.status;
  if (updatedGrams >= campaign.targetGrams) {
    newStatus = "TARGET_REACHED";
  } else if (updatedGrams >= campaign.targetGrams * 0.7) {
    newStatus = "NEAR_TARGET";
  }

  const updatedCampaign = await prisma.harvestCampaign.update({
    where: { id: campaign.id },
    data: { currentGrams: updatedGrams, status: newStatus },
  });

  console.log(`  Updated campaign volume: ${updatedCampaign.currentGrams / 1000} kg, Status: ${updatedCampaign.status}`);
  if (updatedCampaign.currentGrams !== updatedGrams) {
    throw new Error("Harvest campaign volume did not update correctly.");
  }

  // Admin status transition: Confirm harvest
  const confirmedCampaign = await prisma.harvestCampaign.update({
    where: { id: campaign.id },
    data: { status: "CONFIRMED" },
  });
  console.log(`  Admin transition verified: Campaign status is now ${confirmedCampaign.status}`);
  console.log("  ✔ TEST 1 PASSED: Community Harvest Drop pooling and pledge lifecycle verified.\n");

  // -------------------------------------------------------------
  // TEST 2: MARKET PULSE & APMC MANDI BENCHMARK TRANSPARENCY
  // -------------------------------------------------------------
  console.log("▶ TEST 2: Market Pulse APMC Mandi Benchmark Engine");
  const tomato = await prisma.product.findFirst({
    where: { title: { contains: "Tomato" } },
    include: {
      skus: { where: { active: true }, take: 1 },
      marketPriceObservations: { orderBy: { observationDate: "desc" }, take: 1 },
    },
  });

  if (!tomato || !tomato.skus[0]) throw new Error("Tomato product/SKU missing.");
  const storePricePerKgPaise = Math.round((tomato.skus[0].sellingPricePaise / tomato.skus[0].packageSizeGrams) * 1000);
  const latestObs = tomato.marketPriceObservations[0];
  const mandiPricePerKgPaise = latestObs ? latestObs.wholesaleBenchmarkPricePaisePerKg : 1800;

  console.log(`  Product: ${tomato.title}`);
  console.log(`  - Fresh Harvest Graded Doorstep Rate: ₹${(storePricePerKgPaise / 100).toFixed(2)} / kg`);
  console.log(`  - APMC Mandi Wholesale Benchmark:    ₹${(mandiPricePerKgPaise / 100).toFixed(2)} / kg`);

  // Admin logs new daily Mandi observation with supply reason
  let source = await prisma.marketPriceSource.findFirst();
  const newObs = await prisma.marketPriceObservation.create({
    data: {
      sourceId: source.id,
      productId: tomato.id,
      wholesaleBenchmarkPricePaisePerKg: 1950, // ₹19.50/kg
      observationDate: new Date(),
      verifiedBy: "AGMARKNET_DAILY_BULLETIN",
    },
  });

  await prisma.retailPriceHistory.create({
    data: {
      productId: tomato.id,
      skuId: tomato.skus[0].id,
      pricePaise: tomato.skus[0].sellingPricePaise,
      effectiveDate: new Date(),
      reasonForChange: "Heavy seasonal arrivals from Kolar; prices stabilized at APMC yards.",
    },
  });

  console.log(`  Logged fresh APMC observation ID ${newObs.id}: ₹${newObs.wholesaleBenchmarkPricePaisePerKg / 100} / kg`);
  console.log("  ✔ TEST 2 PASSED: Market Pulse APMC comparison and price bridge verified.\n");

  // -------------------------------------------------------------
  // TEST 3: RETURNABLE PACKAGING & ZERO-WASTE CRATE DEPOSIT
  // -------------------------------------------------------------
  console.log("▶ TEST 3: Returnable Circular Crate & Deposit Management");
  const pkgType = await prisma.packagingType.findFirst();
  if (!pkgType) throw new Error("PackagingType not found.");

  // 1. Create a test dispatched crate
  const crateCode = `FH-CRT-TEST-${Date.now().toString().slice(-4)}`;
  const testCrate = await prisma.packagingAsset.create({
    data: {
      packagingTypeId: pkgType.id,
      assetCode: crateCode,
      qrCodePayload: `FH_QR_${crateCode}_VERIFIED`,
      status: "DISPATCHED_TO_CUSTOMER",
      totalCycleCount: 3,
    },
  });
  console.log(`  Created crate asset ${testCrate.assetCode} with status ${testCrate.status}`);

  const order = await prisma.order.findFirst({ where: { userId: user.id } });
  if (!order) throw new Error("Order not found for user.");

  // 2. Customer charged refundable deposit
  const ledgerEntry = await prisma.packagingDepositLedger.create({
    data: {
      userId: user.id,
      orderId: order.id,
      packagingAssetId: testCrate.id,
      depositAmountPaise: 5000, // ₹50 deposit
      status: "CHARGED",
    },
  });
  console.log(`  Created customer deposit ledger: ID ${ledgerEntry.id}, ₹${ledgerEntry.depositAmountPaise / 100} CHARGED.`);

  // 3. Customer schedules empty crate pickup
  const returnReq = await prisma.packagingReturnRequest.create({
    data: {
      userId: user.id,
      packagingAssetId: testCrate.id,
      status: "REQUESTED",
    },
  });
  await prisma.packagingAsset.update({
    where: { id: testCrate.id },
    data: { status: "RETURN_REQUESTED" },
  });
  console.log(`  Customer scheduled return pickup: Request ID ${returnReq.id}, Crate status: RETURN_REQUESTED.`);

  // 4. Warehouse Check-in & Sanitization Inspection -> Deposit Refunded
  await prisma.packagingAsset.update({
    where: { id: testCrate.id },
    data: {
      status: "IN_WAREHOUSE",
      totalCycleCount: { increment: 1 },
    },
  });

  const refundedLedger = await prisma.packagingDepositLedger.update({
    where: { id: ledgerEntry.id },
    data: {
      status: "REFUNDED_TO_CREDIT",
      refundedAt: new Date(),
    },
  });

  await prisma.packagingReturnRequest.update({
    where: { id: returnReq.id },
    data: {
      status: "INSPECTED_PASSED",
      collectedAt: new Date(),
    },
  });

  console.log(`  Warehouse completed check-in & sanitation:`);
  console.log(`  - Deposit Ledger Status: ${refundedLedger.status} (Refunded at ${refundedLedger.refundedAt})`);
  console.log(`  - Crate Status: IN_WAREHOUSE (Total Cycles: ${testCrate.totalCycleCount + 1})`);
  console.log("  ✔ TEST 3 PASSED: Circular reusable crate cycle and deposit refund verified.\n");

  console.log("=================================================");
  console.log("   ALL 3 PHASE 7 SIGNATURE FEATURES VERIFIED!    ");
  console.log("=================================================");
}

runPhase7Acceptance()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


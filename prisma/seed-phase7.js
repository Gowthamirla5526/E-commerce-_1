const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedPhase7() {
  console.log("Seeding Phase 7: Harvest Drops, Market Pulse, and Reusable Packaging...");

  const user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  const products = await prisma.product.findMany();
  const tomato = products.find((p) => p.title.includes("Tomato"));
  const carrot = products.find((p) => p.title.includes("Carrot"));
  const banana = products.find((p) => p.title.includes("Banana"));
  const palak = products.find((p) => p.title.includes("Palak"));

  // 1. Harvest Campaigns
  const campaigns = [
    {
      title: "Kolar FPO Collective Vine-Ripened Country Tomatoes",
      slug: "community-drop-kolar-tomatoes-harvest",
      farmName: "Kolar Valley Horticulture FPO",
      location: "Bangarapet, Kolar District, Karnataka",
      harvestDate: new Date(Date.now() + 86400000 * 3),
      deliveryWindowStart: new Date(Date.now() + 86400000 * 3),
      deliveryWindowEnd: new Date(Date.now() + 86400000 * 4),
      targetGrams: 800000, // 800 kg
      currentGrams: 480000, // 480 kg (60%)
      unitPricePaise: 2400, // ₹24 / kg (vs ₹36 retail)
      benchmarkRetailPricePaise: 3600,
      minHouseholdLimit: 40,
      maxHouseholdLimit: 200,
      deadlineAt: new Date(Date.now() + 86400000 * 2),
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
      description: "Harvested directly at peak natural vine-ripeness when 800 kg total neighborhood orders are pooled. Zero cold-storage stagnation.",
      status: "OPEN",
    },
    {
      title: "Nilgiri Mountain Sweet Orange Carrots Cold Drop",
      slug: "community-drop-nilgiri-carrots",
      farmName: "Nilgiri High-Altitude Organic Growers",
      location: "Ooty Valley, The Nilgiris, Tamil Nadu",
      harvestDate: new Date(Date.now() + 86400000 * 2),
      deliveryWindowStart: new Date(Date.now() + 86400000 * 2),
      deliveryWindowEnd: new Date(Date.now() + 86400000 * 3),
      targetGrams: 400000, // 400 kg
      currentGrams: 400000, // 100% (Target reached)
      unitPricePaise: 4800, // ₹48 / kg (vs ₹68 retail)
      benchmarkRetailPricePaise: 6800,
      minHouseholdLimit: 30,
      maxHouseholdLimit: 150,
      deadlineAt: new Date(Date.now() + 86400000 * 1),
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80",
      description: "Crisp high-altitude mountain carrots with sweet tender core. Farm-gate dispatch directly upon target lock.",
      status: "TARGET_REACHED",
    },
  ];

  for (const c of campaigns) {
    await prisma.harvestCampaign.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  // 2. Market Price Observations
  const source = await prisma.marketPriceSource.findFirst();
  if (source) {
    const observations = [
      { product: tomato, price: 1800 }, // ₹18/kg Mandi wholesale
      { product: carrot, price: 4200 }, // ₹42/kg Mandi wholesale
      { product: banana, price: 3200 }, // ₹32/kg Mandi wholesale
      { product: palak, price: 1500 },  // ₹15/kg Mandi wholesale
    ];

    for (const obs of observations) {
      if (obs.product) {
        await prisma.marketPriceObservation.create({
          data: {
            sourceId: source.id,
            productId: obs.product.id,
            wholesaleBenchmarkPricePaisePerKg: obs.price,
            observationDate: new Date(),
            verifiedBy: "AGMARKNET_DAILY_BULLETIN",
          },
        });
      }
    }
  }

  // 3. Packaging Assets and Active Customer Possession
  const pkgType = await prisma.packagingType.findFirst();
  if (pkgType) {
    const asset2 = await prisma.packagingAsset.upsert({
      where: { assetCode: "FH-CRT-00105" },
      update: {},
      create: {
        packagingTypeId: pkgType.id,
        assetCode: "FH-CRT-00105",
        qrCodePayload: "FH_QR_SIG_CRATE_00105_VERIFIED",
        status: "DISPATCHED_TO_CUSTOMER",
        totalCycleCount: 2,
      },
    });

    const asset3 = await prisma.packagingAsset.upsert({
      where: { assetCode: "FH-CRT-00106" },
      update: {},
      create: {
        packagingTypeId: pkgType.id,
        assetCode: "FH-CRT-00106",
        qrCodePayload: "FH_QR_SIG_CRATE_00106_VERIFIED",
        status: "IN_WAREHOUSE",
        totalCycleCount: 5,
      },
    });

    // Create active customer ledger entry for asset2
    if (user) {
      const order = await prisma.order.findFirst({ where: { userId: user.id } });
      if (order) {
        await prisma.packagingDepositLedger.create({
          data: {
            userId: user.id,
            orderId: order.id,
            packagingAssetId: asset2.id,
            depositAmountPaise: 5000, // ₹50 deposit
            status: "CHARGED",
          },
        });
      }
    }
  }

  console.log("Phase 7 seeding completed successfully!");
}

seedPhase7()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


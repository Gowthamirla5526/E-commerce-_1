const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Fresh Harvest database seeding...");

  // 1. Business Settings
  const settings = [
    { key: "business_name", value: "Fresh Harvest Produce Co." },
    { key: "brand_tagline", value: "Farm-Verified Perishable Produce & Intelligent Kitchen Planning" },
    { key: "contact_email", value: "support@freshharvest.co.in" },
    { key: "contact_phone", value: "+91 80 4912 3000" },
    { key: "operating_city", value: "Bengaluru, Karnataka" },
    { key: "default_currency", value: "INR" },
    { key: "min_order_paise", value: "19900" }, // ₹199
    { key: "free_delivery_threshold_paise", value: "49900" }, // ₹499
    { key: "standard_delivery_fee_paise", value: "2900" }, // ₹29
  ];

  for (const s of settings) {
    await prisma.businessSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Demo Users & Roles
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@freshharvest.co.in" },
    update: {},
    create: {
      email: "admin@freshharvest.co.in",
      phone: "+919876543210",
      passwordHash: "demo_hash_fresh_harvest_secure_2026",
      name: "Radha Krishnan (Store Director)",
      role: "ADMIN",
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "picking.lead@freshharvest.co.in" },
    update: {},
    create: {
      email: "picking.lead@freshharvest.co.in",
      phone: "+919876543211",
      passwordHash: "demo_hash_fresh_harvest_secure_2026",
      name: "Suresh Gowda",
      role: "PICKING_STAFF",
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: "customer.ananya@example.com" },
    update: {},
    create: {
      email: "customer.ananya@example.com",
      phone: "+919876543220",
      name: "Ananya Sharma",
      passwordHash: "demo_hash_fresh_harvest_secure_2026",
      role: "CUSTOMER",
    },
  });

  await prisma.address.upsert({
    where: { id: "demo-address-ananya" },
    update: {},
    create: {
      id: "demo-address-ananya",
      userId: demoCustomer.id,
      label: "Home",
      recipientName: "Ananya Sharma",
      phone: "+919876543220",
      streetLine1: "Flat 402, Green Glen Terraces",
      streetLine2: "Outer Ring Road, Bellandur",
      locality: "Bellandur",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      isDefault: true,
    },
  });

  // 3. Delivery Zones & Slots
  const blrZone = await prisma.deliveryZone.upsert({
    where: { id: "blr-core-zone" },
    update: {},
    create: {
      id: "blr-core-zone",
      name: "Bengaluru Urban Core (East & Central)",
      pincodesJson: JSON.stringify([
        "560001", "560025", "560034", "560038", "560100", "560103", "560066"
      ]),
      deliveryFeePaise: 2900,
      minOrderPaise: 19900,
      active: true,
    },
  });

  const slots = [
    { id: "slot-morning", name: "Early Bird Fresh (06:30 - 09:30 AM)", startTime: "06:30", endTime: "09:30" },
    { id: "slot-midday", name: "Afternoon Prep (11:30 AM - 02:30 PM)", startTime: "11:30", endTime: "14:30" },
    { id: "slot-evening", name: "Evening Dinner Batch (05:30 - 08:30 PM)", startTime: "17:30", endTime: "20:30" },
  ];

  for (const sl of slots) {
    await prisma.deliverySlot.upsert({
      where: { id: sl.id },
      update: {},
      create: {
        id: sl.id,
        zoneId: blrZone.id,
        name: sl.name,
        startTime: sl.startTime,
        endTime: sl.endTime,
        cutoffHoursBefore: 2,
        maxCapacityOrders: 60,
      },
    });
  }

  // 4. Suppliers & Inventory Locations
  const supplierKolar = await prisma.supplier.upsert({
    where: { code: "SUP-KOLAR-FPO" },
    update: {},
    create: {
      code: "SUP-KOLAR-FPO",
      name: "Kolar Horticultural Farmers Producer Organization",
      contactName: "Venkatesh Murthy",
      phone: "+91 8152 234100",
      email: "procurement@kolarfpo.org",
      district: "Kolar",
      state: "Karnataka",
    },
  });

  const supplierMysuru = await prisma.supplier.upsert({
    where: { code: "SUP-MYS-FRUITS" },
    update: {},
    create: {
      code: "SUP-MYS-FRUITS",
      name: "Nanjangud & Mysuru Heritage Fruit Producers",
      contactName: "Basavaraju M",
      phone: "+91 821 245990",
      district: "Mysuru",
      state: "Karnataka",
    },
  });

  const supplierOoty = await prisma.supplier.upsert({
    where: { code: "SUP-NILGIRI-COOL" },
    update: {},
    create: {
      code: "SUP-NILGIRI-COOL",
      name: "Nilgiri Mountain Crisp Produce Society",
      contactName: "Rajan K",
      phone: "+91 423 224410",
      district: "Nilgiris",
      state: "Tamil Nadu",
    },
  });

  const darkstore = await prisma.inventoryLocation.upsert({
    where: { code: "BLR-INDIRANAGAR-01" },
    update: {},
    create: {
      code: "BLR-INDIRANAGAR-01",
      name: "Indiranagar Cold-Chain Micro-Fulfilment Center",
      pincode: "560038",
      address: "Plot 12, 100ft Road, Indiranagar, Bengaluru",
    },
  });

  // 5. Categories
  const catFruits = await prisma.category.upsert({
    where: { slug: "fresh-fruits" },
    update: {},
    create: {
      name: "Fresh Fruits",
      slug: "fresh-fruits",
      description: "Naturally ripened, fresh-picked orchard fruits and berries.",
      icon: "Apple",
      displayOrder: 1,
      isLeafyVegetable: false,
    },
  });

  const catVegetables = await prisma.category.upsert({
    where: { slug: "daily-vegetables" },
    update: {},
    create: {
      name: "Daily Vegetables",
      slug: "daily-vegetables",
      description: "Crisp staples, gourds, roots, and native cooking vegetables.",
      icon: "Carrot",
      displayOrder: 2,
      isLeafyVegetable: false,
    },
  });

  const catLeafy = await prisma.category.upsert({
    where: { slug: "leafy-greens" },
    update: {},
    create: {
      name: "Leafy Vegetables & Greens",
      slug: "leafy-greens",
      description: "Freshly cut morning greens, palak, methi, and traditional soppu.",
      icon: "Salad",
      displayOrder: 3,
      isLeafyVegetable: true,
    },
  });

  const catSeasonal = await prisma.category.upsert({
    where: { slug: "seasonal-harvests" },
    update: {},
    create: {
      name: "Seasonal Harvests",
      slug: "seasonal-harvests",
      description: "Peak-season harvest drops, authentic mango varieties, and hill berries.",
      icon: "Sparkles",
      displayOrder: 4,
      isLeafyVegetable: false,
    },
  });

  // 6. Products & SKUs
  const productsData = [
    {
      title: "Kolar Vine-Ripened Hybrid Tomatoes",
      slug: "kolar-vine-ripened-tomatoes",
      categoryId: catVegetables.id,
      scientificName: "Solanum lycopersicum",
      regionalNames: { kannada: "ತೊಗರಿ ಟೊಮೆಟೊ", tamil: "தக்காளி", hindi: "टमाटर", telugu: "టమాటా" },
      description: "Hand-sorted, firm, glossy red tomatoes harvested at turning stage for longer shelf life at home.",
      originRegion: "Kolar, Karnataka",
      isSeasonal: false,
      featuredImageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
      skuCode: "SKU-TOMATO-KOLAR-500G",
      packageSizeGrams: 500,
      mrpPaise: 3500, // ₹35
      sellingPricePaise: 2600, // ₹26
      storage: {
        idealStorageMethod: "ROOM_TEMPERATURE",
        optimalTempCelsius: "18-22°C",
        expectedShelfLifeDays: 6,
        ethyleneSensitive: false,
        prepTip: "Do not refrigerate until fully ripe to retain natural sweetness and aroma.",
      },
      regionalDetail: {
        nativeState: "Karnataka",
        harvestSeasonText: "Year-Round, Peak Winter",
        flavorProfile: "Mildly acidic, rich in umami, balanced juiciness",
        textureProfile: "Firm exterior with juicy inner pulp",
        culinaryTradition: "Essential for Karnataka Saaru, Rasam, and curries",
        folkUseTips: "Use firm tomatoes for salads and slicing; use softer ones for slow-simmered gravies.",
      },
      batch: {
        batchNumber: "BATCH-20261104-TOM-01",
        quantityGrams: 150000, // 150 kg
        unitCostPaise: 1600,
        readinessStage: "TURNING",
        shelfDays: 5,
        supplierId: supplierKolar.id,
      },
    },
    {
      title: "Mysuru Yelakki Banana (GI Tagged Variety)",
      slug: "mysuru-yelakki-banana",
      categoryId: catFruits.id,
      scientificName: "Musa acuminata",
      regionalNames: { kannada: "ಏಲಕ್ಕಿ ಬಾಳೆಹಣ್ಣು", tamil: "ஏலக்கி வாழைப்பழம்", hindi: "इलायची केला", telugu: "ఏలకులు అరటి" },
      description: "Naturally sweet, fragrant miniature bananas with paper-thin peel and dense, creamy pulp.",
      originRegion: "Mysuru / Mandya, Karnataka",
      isSeasonal: false,
      featuredImageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
      skuCode: "SKU-BANANA-YELAKKI-500G",
      packageSizeGrams: 500,
      mrpPaise: 4500,
      sellingPricePaise: 3800, // ₹38 / 500g
      storage: {
        idealStorageMethod: "ROOM_TEMPERATURE",
        optimalTempCelsius: "16-20°C",
        expectedShelfLifeDays: 4,
        ethyleneProducer: true,
        ethyleneSensitive: false,
        prepTip: "Keep stem cluster wrapped in parchment to slow down ripening.",
      },
      regionalDetail: {
        nativeState: "Karnataka",
        harvestSeasonText: "Continuous Harvest",
        flavorProfile: "Subtly floral, intense natural sweetness",
        textureProfile: "Smooth, velvety, non-sticky",
        culinaryTradition: "Auspicious fruit in South Indian temple offerings and everyday breakfast.",
        folkUseTips: "Consume when peel develops tiny brown sugar flecks for optimum digestion.",
      },
      batch: {
        batchNumber: "BATCH-20261104-BAN-01",
        quantityGrams: 120000,
        unitCostPaise: 2500,
        readinessStage: "READY_TO_EAT",
        shelfDays: 3,
        supplierId: supplierMysuru.id,
      },
    },
    {
      title: "Nilgiri Mountain Crisp Carrots",
      slug: "nilgiri-mountain-crisp-carrots",
      categoryId: catVegetables.id,
      scientificName: "Daucus carota subsp. sativus",
      regionalNames: { kannada: "ಕ್ಯಾರೆಟ್", tamil: "கேரட்", hindi: "गाजर", telugu: "క్యారెట్" },
      description: "High-altitude sweet orange carrots with crunchy texture and natural sugar concentration.",
      originRegion: "Ooty (Nilgiris), Tamil Nadu",
      isSeasonal: false,
      featuredImageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80",
      skuCode: "SKU-CARROT-OOTY-500G",
      packageSizeGrams: 500,
      mrpPaise: 4800,
      sellingPricePaise: 3900, // ₹39 / 500g
      storage: {
        idealStorageMethod: "REFRIGERATE",
        optimalTempCelsius: "2-5°C",
        expectedShelfLifeDays: 10,
        ethyleneSensitive: true,
        prepTip: "Store in breathable crisper container away from apples and bananas.",
      },
      regionalDetail: {
        nativeState: "Tamil Nadu",
        harvestSeasonText: "Year-Round",
        flavorProfile: "Crisp, refreshing, pronounced natural sweetness",
        textureProfile: "Snap-crisp core without fibrous woody strands",
        culinaryTradition: "Raw salads, carrot poriyal, and sweet halwa.",
        folkUseTips: "Wash right before cooking to preserve the tender outer skin.",
      },
      batch: {
        batchNumber: "BATCH-20261104-CAR-01",
        quantityGrams: 200000,
        unitCostPaise: 2400,
        readinessStage: "READY_TO_EAT",
        shelfDays: 8,
        supplierId: supplierOoty.id,
      },
    },
    {
      title: "Farm-Fresh Desi Palak (Native Spinach)",
      slug: "farm-fresh-desi-palak",
      categoryId: catLeafy.id,
      scientificName: "Spinacia oleracea",
      regionalNames: { kannada: "ಪಾಲಕ್ ಸೊಪ್ಪು", tamil: "பசலைக்கீரை", hindi: "पालक", telugu: "పాలకూర" },
      description: "Tender, broad emerald green leaves harvested at dawn and mist-chilled to lock in crispness.",
      originRegion: "Hoskote, Bengaluru Rural",
      isSeasonal: false,
      featuredImageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
      skuCode: "SKU-PALAK-DESI-250G",
      packageSizeGrams: 250,
      mrpPaise: 2500,
      sellingPricePaise: 1800, // ₹18 / 250g bunch
      storage: {
        idealStorageMethod: "REFRIGERATE",
        optimalTempCelsius: "3-6°C",
        expectedShelfLifeDays: 3,
        ethyleneSensitive: true,
        prepTip: "Do not wash until ready to cook; wrap in paper towel inside refrigerator crisper.",
      },
      regionalDetail: {
        nativeState: "Karnataka",
        harvestSeasonText: "Year-Round",
        flavorProfile: "Earthy, mineral-rich, tender sweet stems",
        textureProfile: "Delicate tender leaves",
        culinaryTradition: "Palak Paneer, Dal Palak, and South Indian Soppu Saaru.",
        folkUseTips: "Blanch in salted boiling water for 90 seconds then ice bath to retain bright green color.",
      },
      batch: {
        batchNumber: "BATCH-20261104-PAL-01",
        quantityGrams: 60000,
        unitCostPaise: 1000,
        readinessStage: "PEAK",
        shelfDays: 2,
        supplierId: supplierKolar.id,
      },
    },
    {
      title: "Tindora / Ivy Gourd (Crisp Tondekai)",
      slug: "tindora-ivy-gourd-tondekai",
      categoryId: catVegetables.id,
      scientificName: "Coccinia grandis",
      regionalNames: { kannada: "ತೊಂಡೆಕಾಯಿ", tamil: "கோவக்காய்", hindi: "कुंदरू / टिंडोरा", telugu: "దొండకాయ" },
      description: "Crunchy miniature gourds, carefully graded for pale seeds and zero bitterness.",
      originRegion: "Chintamani, Karnataka",
      isSeasonal: false,
      featuredImageUrl: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80",
      skuCode: "SKU-TINDORA-KUNDRU-500G",
      packageSizeGrams: 500,
      mrpPaise: 3800,
      sellingPricePaise: 2900, // ₹29 / 500g
      storage: {
        idealStorageMethod: "REFRIGERATE",
        optimalTempCelsius: "5-9°C",
        expectedShelfLifeDays: 7,
        ethyleneSensitive: false,
        prepTip: "Store in breathable cloth bag to prevent moisture condensation.",
      },
      regionalDetail: {
        nativeState: "Karnataka",
        harvestSeasonText: "Year-Round",
        flavorProfile: "Mild, nutty undertones, tender crunch",
        textureProfile: "Crisp bite with succulent seed center",
        culinaryTradition: "Shallow-fried Tondekai Palya with crushed groundnuts and dry coconut.",
        folkUseTips: "Slit lengthwise into quarters for quicker, evenly caramelized pan-roasting.",
      },
      batch: {
        batchNumber: "BATCH-20261104-TIN-01",
        quantityGrams: 90000,
        unitCostPaise: 1700,
        readinessStage: "READY_TO_EAT",
        shelfDays: 6,
        supplierId: supplierKolar.id,
      },
    },
    {
      title: "Devgad Alphonso Mango (Pre-Harvest Booking Batch)",
      slug: "devgad-alphonso-mango",
      categoryId: catSeasonal.id,
      scientificName: "Mangifera indica 'Alphonso'",
      regionalNames: { kannada: "ರತ್ನಗಿರಿ ಆಪೂಸ್ ಮಾವಿನಹಣ್ಣು", tamil: "அல்போன்சா மாம்பழம்", hindi: "हापुस आम", telugu: "అల్ఫోన్సో మామిడి" },
      description: "King of mangoes from coastal laterite soil. Saffron pulp, low fibre, unforgettable tropical perfume.",
      originRegion: "Devgad, Maharashtra",
      isSeasonal: true,
      featuredImageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
      skuCode: "SKU-MANGO-DEVGAD-1KG",
      packageSizeGrams: 1000,
      mrpPaise: 65000,
      sellingPricePaise: 54900, // ₹549 / 1 kg (3-4 pcs)
      storage: {
        idealStorageMethod: "ROOM_TEMPERATURE",
        optimalTempCelsius: "22-26°C",
        expectedShelfLifeDays: 5,
        ethyleneProducer: true,
        ethyleneSensitive: false,
        prepTip: "Never place unripened Alphonso in the fridge; let it ripen naturally in rice or hay.",
      },
      regionalDetail: {
        nativeState: "Maharashtra",
        harvestSeasonText: "Mid March - Early June",
        flavorProfile: "Intensely sweet, floral, buttery with subtle citrus zest note",
        textureProfile: "Silky, completely non-fibrous melt-in-mouth pulp",
        culinaryTradition: "Aamras paired with piping hot pooris.",
        folkUseTips: "Soak whole ripe mangoes in water for 30 minutes before cutting to neutralize natural fruit heat.",
      },
      batch: {
        batchNumber: "BATCH-20261104-MNG-01",
        quantityGrams: 50000,
        unitCostPaise: 38000,
        readinessStage: "TURNING",
        shelfDays: 5,
        supplierId: supplierMysuru.id,
      },
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        categoryId: item.categoryId,
        title: item.title,
        slug: item.slug,
        scientificName: item.scientificName,
        regionalNamesJson: JSON.stringify(item.regionalNames),
        description: item.description,
        originRegion: item.originRegion,
        isSeasonal: item.isSeasonal,
        featuredImageUrl: item.featuredImageUrl,
        galleryUrlsJson: JSON.stringify([item.featuredImageUrl]),
      },
    });

    const sku = await prisma.sku.upsert({
      where: { skuCode: item.skuCode },
      update: {},
      create: {
        productId: product.id,
        skuCode: item.skuCode,
        unitType: "GRAMS",
        packageSizeGrams: item.packageSizeGrams,
        mrpPaise: item.mrpPaise,
        sellingPricePaise: item.sellingPricePaise,
      },
    });

    await prisma.storageGuide.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        idealStorageMethod: item.storage.idealStorageMethod,
        optimalTempCelsius: item.storage.optimalTempCelsius,
        expectedShelfLifeDays: item.storage.expectedShelfLifeDays,
        ethyleneProducer: item.storage.ethyleneProducer || false,
        ethyleneSensitive: item.storage.ethyleneSensitive || false,
        prepTip: item.storage.prepTip,
      },
    });

    await prisma.regionalProduceDetail.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        nativeState: item.regionalDetail.nativeState,
        harvestSeasonText: item.regionalDetail.harvestSeasonText,
        flavorProfile: item.regionalDetail.flavorProfile,
        textureProfile: item.regionalDetail.textureProfile,
        culinaryTradition: item.regionalDetail.culinaryTradition,
        folkUseTips: item.regionalDetail.folkUseTips,
      },
    });

    // Create batch & inspection
    const bestBefore = new Date();
    bestBefore.setDate(bestBefore.getDate() + item.batch.shelfDays);

    const batch = await prisma.inventoryBatch.upsert({
      where: { batchNumber: item.batch.batchNumber },
      update: {},
      create: {
        batchNumber: item.batch.batchNumber,
        skuId: sku.id,
        supplierId: item.batch.supplierId,
        locationId: darkstore.id,
        bestBeforeDate: bestBefore,
        initialQuantityGrams: item.batch.quantityGrams,
        availableQuantityGrams: item.batch.quantityGrams,
        unitCostPaise: item.batch.unitCostPaise,
        readinessStage: item.batch.readinessStage,
        ripenessWindowStart: new Date(),
        ripenessWindowEnd: bestBefore,
        status: "ACTIVE",
      },
    });

    await prisma.qualityInspection.create({
      data: {
        batchId: batch.id,
        inspectorId: staffUser.id,
        inspectionType: "INWARD_GATE",
        overallGrade: "GRADE_A_PREMIUM",
        firmnessScore: 5,
        blemishScore: 5,
        notes: `Inward gate verification passed. Standard produce density and fresh aroma verified.`,
      },
    });

    await prisma.stockLedgerEntry.create({
      data: {
        batchId: batch.id,
        skuId: sku.id,
        entryType: "PROCUREMENT",
        quantityDeltaGrams: item.batch.quantityGrams,
        balanceAfterGrams: item.batch.quantityGrams,
        referenceType: "PURCHASE_RECEIPT",
        notes: "Initial seed procurement entry",
      },
    });
  }

  // 7. Circular Packaging Assets (Feature 8)
  const crateType = await prisma.packagingType.upsert({
    where: { code: "CRATE_MEDIUM" },
    update: {},
    create: {
      name: "Fresh Harvest Ventilated Produce Crate (Medium - 5kg)",
      code: "CRATE_MEDIUM",
      depositPaise: 10000, // ₹100 deposit
      maxReuses: 100,
    },
  });

  const crateAsset = await prisma.packagingAsset.upsert({
    where: { assetCode: "FH-CRT-00104" },
    update: {},
    create: {
      packagingTypeId: crateType.id,
      assetCode: "FH-CRT-00104",
      qrCodePayload: "FH_QR_SIG_CRATE_00104_VERIFIED",
      status: "IN_WAREHOUSE",
      totalCycleCount: 4,
    },
  });

  // 8. Community Harvest Drop Campaign (Feature 4)
  const harvestDeadline = new Date();
  harvestDeadline.setDate(harvestDeadline.getDate() + 3);

  const dropStart = new Date();
  dropStart.setDate(dropStart.getDate() + 4);

  const dropEnd = new Date();
  dropEnd.setDate(dropEnd.getDate() + 5);

  await prisma.harvestCampaign.upsert({
    where: { slug: "community-drop-devgad-mangoes-batch-1" },
    update: {},
    create: {
      title: "Devgad Farm-Direct Alphonso Mango Harvest Drop #1",
      slug: "community-drop-devgad-mangoes-batch-1",
      farmName: "Sahyadri Heritage Orchards",
      location: "Devgad Coastal Ridge, Maharashtra",
      harvestDate: dropStart,
      deliveryWindowStart: dropStart,
      deliveryWindowEnd: dropEnd,
      targetGrams: 500000, // 500 kg community target
      currentGrams: 360000, // 360 kg currently pledged (72% reached)
      unitPricePaise: 42000, // ₹420 / 1 kg (Wholesale direct price)
      benchmarkRetailPricePaise: 55000, // ₹550 retail comparison
      minHouseholdLimit: 50,
      maxHouseholdLimit: 250,
      deadlineAt: harvestDeadline,
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
      description: "Direct tree-ripened Alphonso mangoes harvested only when the group target is confirmed. Zero chemical ripening.",
      status: "NEAR_TARGET",
    },
  });

  // 9. Market Pulse Benchmark (Feature 7)
  const apmcSource = await prisma.marketPriceSource.upsert({
    where: { id: "source-apmc-yeshwanthpur" },
    update: {},
    create: {
      id: "source-apmc-yeshwanthpur",
      sourceName: "APMC Yeshwanthpur Wholesale Market Benchmark",
      location: "Bengaluru",
      state: "Karnataka",
    },
  });

  const tomatoProduct = await prisma.product.findUnique({ where: { slug: "kolar-vine-ripened-tomatoes" } });
  if (tomatoProduct) {
    await prisma.marketPriceObservation.create({
      data: {
        sourceId: apmcSource.id,
        productId: tomatoProduct.id,
        wholesaleBenchmarkPricePaisePerKg: 1800, // ₹18/kg mandi auction rate
        observationDate: new Date(),
        verifiedBy: "AGMARKNET_DAILY_BULLETIN",
      },
    });
  }

  // 10. Sample Household Fridge Items for Demo Customer (Feature 2)
  if (tomatoProduct) {
    const fridgeExpiry = new Date();
    fridgeExpiry.setDate(fridgeExpiry.getDate() + 3);

    await prisma.householdProduceItem.create({
      data: {
        userId: demoCustomer.id,
        productId: tomatoProduct.id,
        customName: "Tomatoes (Leftover from last basket)",
        quantityGrams: 350,
        estimatedExpiryDate: fridgeExpiry,
        status: "IN_FRIDGE",
        notes: "Good condition, slight softness.",
      },
    });
  }

  console.log("✅ Seed completed successfully! Created realistic products, batches, campaigns, and settings.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


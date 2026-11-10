const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedRecipes() {
  console.log("🌱 Seeding produce-first curated recipes...");

  const tomato = await prisma.product.findUnique({ where: { slug: "kolar-vine-ripened-tomatoes" }, include: { skus: true } });
  const banana = await prisma.product.findUnique({ where: { slug: "mysuru-yelakki-banana" }, include: { skus: true } });
  const carrot = await prisma.product.findUnique({ where: { slug: "nilgiri-mountain-crisp-carrots" }, include: { skus: true } });
  const palak = await prisma.product.findUnique({ where: { slug: "farm-fresh-desi-palak" }, include: { skus: true } });
  const tindora = await prisma.product.findUnique({ where: { slug: "tindora-ivy-gourd-tondekai" }, include: { skus: true } });
  const mango = await prisma.product.findUnique({ where: { slug: "devgad-alphonso-mango" }, include: { skus: true } });

  const recipes = [
    {
      title: "Homestyle Desi Palak Dal",
      slug: "homestyle-desi-palak-dal",
      mealCategory: "LUNCH",
      prepTimeMinutes: 25,
      serves: 2,
      instructions: "Pressure cook toor dal with chopped palak and tomatoes. Temper with cumin, garlic and ghee.",
      dietType: "VEGETARIAN",
      ingredients: [
        { productId: palak.id, skuId: palak.skus[0].id, quantityGrams: 250 },
        { productId: tomato.id, skuId: tomato.skus[0].id, quantityGrams: 250 },
      ],
    },
    {
      title: "Nilgiri Sweet Carrot & Coconut Poriyal",
      slug: "nilgiri-sweet-carrot-poriyal",
      mealCategory: "DINNER",
      prepTimeMinutes: 20,
      serves: 2,
      instructions: "Finely dice carrots. Steam until tender-crisp. Temper with mustard seeds, curry leaves and fresh grated coconut.",
      dietType: "VEGAN",
      ingredients: [
        { productId: carrot.id, skuId: carrot.skus[0].id, quantityGrams: 500 },
      ],
    },
    {
      title: "Authentic Karnataka Tomato Saaru",
      slug: "authentic-karnataka-tomato-saaru",
      mealCategory: "LUNCH",
      prepTimeMinutes: 20,
      serves: 2,
      instructions: "Boil ripe turning tomatoes with rasam powder and tamarind. Finish with fresh coriander and asafoetida temper.",
      dietType: "VEGETARIAN",
      ingredients: [
        { productId: tomato.id, skuId: tomato.skus[0].id, quantityGrams: 500 },
      ],
    },
    {
      title: "Crunchy Tondekai / Tindora Fry",
      slug: "crunchy-tondekai-fry",
      mealCategory: "DINNER",
      prepTimeMinutes: 25,
      serves: 2,
      instructions: "Slit tindora into thin batons. Shallow fry with turmeric and crushed groundnuts for a crisp side dish.",
      dietType: "VEGAN",
      ingredients: [
        { productId: tindora.id, skuId: tindora.skus[0].id, quantityGrams: 500 },
      ],
    },
    {
      title: "Yelakki Banana & Oats Morning Bowl",
      slug: "yelakki-banana-oats-bowl",
      mealCategory: "BREAKFAST",
      prepTimeMinutes: 10,
      serves: 2,
      instructions: "Slice miniature yelakki bananas over warm cinnamon oats with chia seeds and honey.",
      dietType: "VEGETARIAN",
      ingredients: [
        { productId: banana.id, skuId: banana.skus[0].id, quantityGrams: 500 },
      ],
    },
    {
      title: "Devgad Farm Alphonso Aamras",
      slug: "devgad-farm-alphonso-aamras",
      mealCategory: "DINNER",
      prepTimeMinutes: 15,
      serves: 2,
      instructions: "Puree tree-ripened Alphonso pulp with a pinch of green cardamom. Serve chilled with hot puris.",
      dietType: "VEGETARIAN",
      ingredients: [
        { productId: mango.id, skuId: mango.skus[0].id, quantityGrams: 1000 },
      ],
    },
    {
      title: "Crisp Garden Carrot & Tomato Kachumber",
      slug: "crisp-garden-carrot-tomato-kachumber",
      mealCategory: "LUNCH",
      prepTimeMinutes: 10,
      serves: 2,
      instructions: "Toss diced carrots and firm tomatoes with lime juice, green chilli and roasted cumin.",
      dietType: "VEGAN",
      ingredients: [
        { productId: carrot.id, skuId: carrot.skus[0].id, quantityGrams: 250 },
        { productId: tomato.id, skuId: tomato.skus[0].id, quantityGrams: 250 },
      ],
    },
  ];

  for (const r of recipes) {
    const recipe = await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        title: r.title,
        slug: r.slug,
        mealCategory: r.mealCategory,
        prepTimeMinutes: r.prepTimeMinutes,
        serves: r.serves,
        instructions: r.instructions,
        dietType: r.dietType,
      },
    });

    for (const ing of r.ingredients) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          productId: ing.productId,
          skuId: ing.skuId,
          quantityGrams: ing.quantityGrams,
        },
      });
    }
  }

  console.log("✅ Seeded", recipes.length, "produce-first recipes.");
}

seedRecipes().finally(() => prisma.$disconnect());


import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";

const planGenerateSchema = z.object({
  householdSize: z.number().int().min(1).max(10).default(2),
  targetBudgetPaise: z.number().int().positive().default(150000), // ₹1500
  dietType: z.enum(["VEGETARIAN", "VEGAN", "JAIN"]).default("VEGETARIAN"),
});

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    let userId = session?.userId;

    if (!userId) {
      const demo = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      if (demo) userId = demo.id;
    }

    const body = await req.json().catch(() => ({}));
    const { householdSize, targetBudgetPaise, dietType } = planGenerateSchema.parse(body);

    // 1. Fetch available recipes with ingredients, products, and active SKUs
    const recipes = await prisma.recipe.findMany({
      where: {
        dietType: dietType === "VEGAN" ? "VEGAN" : undefined,
      },
      include: {
        ingredients: {
          include: {
            product: {
              include: {
                skus: {
                  where: { active: true },
                  take: 1,
                  include: {
                    inventoryBatches: {
                      where: { status: "ACTIVE" },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (recipes.length === 0) {
      return NextResponse.json(
        { success: false, error: "No recipes found matching diet preference." },
        { status: 400 }
      );
    }

    // 2. Fetch customer's active in-fridge items to prevent duplicate shopping
    const inFridgeItems = userId
      ? await prisma.householdProduceItem.findMany({
          where: { userId, status: "IN_FRIDGE" },
        })
      : [];

    const fridgeStockByProduct: Record<string, number> = {};
    inFridgeItems.forEach((f) => {
      if (f.productId) {
        fridgeStockByProduct[f.productId] = (fridgeStockByProduct[f.productId] || 0) + f.quantityGrams;
      }
    });

    // 3. Generate 7 Days
    const scaleFactor = householdSize / 2;
    const days: any[] = [];
    const consolidatedProduceMap: Record<string, {
      product: any;
      sku: any;
      totalRequiredGrams: number;
      inFridgeGrams: number;
      toBuyGrams: number;
      packsToBuy: number;
      costPaise: number;
    }> = {};

    const mealCategories = ["BREAKFAST", "LUNCH", "DINNER"] as const;

    for (let dayNumber = 1; dayNumber <= 7; dayNumber++) {
      const dayMeals: any[] = [];

      for (const cat of mealCategories) {
        const catRecipes = recipes.filter((r) => r.mealCategory === cat);
        const recipe = catRecipes[(dayNumber - 1) % catRecipes.length] || recipes[0];

        const mealIngredients = recipe.ingredients.map((ing) => {
          const reqGrams = Math.round(ing.quantityGrams * scaleFactor);
          const sku = ing.product.skus[0];
          const hasBatch = Boolean(sku?.inventoryBatches?.[0]);
          const inFridgeAvailable = fridgeStockByProduct[ing.productId] || 0;
          const isInFridge = inFridgeAvailable >= reqGrams;

          // Track for basket consolidation
          if (sku && hasBatch) {
            if (!consolidatedProduceMap[sku.id]) {
              consolidatedProduceMap[sku.id] = {
                product: ing.product,
                sku,
                totalRequiredGrams: 0,
                inFridgeGrams: Math.min(inFridgeAvailable, reqGrams),
                toBuyGrams: 0,
                packsToBuy: 0,
                costPaise: 0,
              };
            }
            consolidatedProduceMap[sku.id].totalRequiredGrams += reqGrams;
          }

          return {
            productId: ing.productId,
            productTitle: ing.product.title,
            requiredGrams: reqGrams,
            inFridgeStatus: isInFridge,
            skuCode: sku?.skuCode || null,
            sellingPricePaise: sku?.sellingPricePaise || 0,
          };
        });

        dayMeals.push({
          mealCategory: cat,
          recipeTitle: recipe.title,
          prepTimeMinutes: recipe.prepTimeMinutes,
          ingredients: mealIngredients,
        });
      }

      days.push({
        dayNumber,
        dayName: `Day ${dayNumber}`,
        meals: dayMeals,
      });
    }

    // 4. Compute consolidated shopping basket after deducting in-fridge inventory
    let totalPlanCostPaise = 0;
    const shoppingBasket = Object.values(consolidatedProduceMap).map((item) => {
      const netToBuyGrams = Math.max(0, item.totalRequiredGrams - item.inFridgeGrams);
      const packs = Math.max(1, Math.ceil(netToBuyGrams / item.sku.packageSizeGrams));
      const cost = packs * item.sku.sellingPricePaise;
      totalPlanCostPaise += cost;

      return {
        skuId: item.sku.id,
        productId: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        imageUrl: item.product.featuredImageUrl,
        packageSizeGrams: item.sku.packageSizeGrams,
        sellingPricePaise: item.sku.sellingPricePaise,
        mrpPaise: item.sku.mrpPaise,
        unitType: item.sku.unitType,
        totalRequiredGrams: item.totalRequiredGrams,
        inFridgeGrams: item.inFridgeGrams,
        packsToBuy: packs,
        costPaise: cost,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        householdSize,
        targetBudgetPaise,
        dietType,
        totalPlanCostPaise,
        days,
        shoppingBasket,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate weekly plan." },
      { status: 400 }
    );
  }
}


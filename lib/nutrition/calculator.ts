import { db } from '@/lib/db'
import { ingredients, mealIngredients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface NutritionData {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

// Unit conversion to grams
const unitToGrams: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1, // Assuming 1ml ≈ 1g for simplicity
  l: 1000,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  oz: 28.35,
  lb: 453.59,
  piece: 100, // Average assumption
}

export function convertToGrams(quantity: number, unit: string): number {
  return quantity * (unitToGrams[unit] || 1)
}

export async function calculateMealNutrition(mealId: string): Promise<NutritionData> {
  const mealIngs = await db
    .select({
      quantity: mealIngredients.quantity,
      unit: mealIngredients.unit,
      ingredient: ingredients,
    })
    .from(mealIngredients)
    .innerJoin(ingredients, eq(mealIngredients.ingredientId, ingredients.id))
    .where(eq(mealIngredients.mealId, mealId))

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  for (const mi of mealIngs) {
    const grams = convertToGrams(Number(mi.quantity), mi.unit)
    const factor = grams / 100 // Per 100g basis

    totalCalories += Number(mi.ingredient.caloriesPer100g) * factor
    totalProtein += Number(mi.ingredient.proteinPer100g) * factor
    totalCarbs += Number(mi.ingredient.carbsPer100g) * factor
    totalFat += Number(mi.ingredient.fatPer100g) * factor
  }

  return {
    calories: Math.round(totalCalories * 10) / 10,
    proteinG: Math.round(totalProtein * 10) / 10,
    carbsG: Math.round(totalCarbs * 10) / 10,
    fatG: Math.round(totalFat * 10) / 10,
  }
}

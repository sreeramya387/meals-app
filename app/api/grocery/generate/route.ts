import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { mealPlans, plannedMeals, meals, mealIngredients, ingredients, groceryLists, groceryItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { startOfWeek, format } from 'date-fns'

// POST /api/grocery/generate - Generate grocery list from current week's plan
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { weekDate } = body

    // Get week start
    const referenceDate = weekDate ? new Date(weekDate) : new Date()
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')

    // Get meal plan for this week
    const [mealPlan] = await db
      .select()
      .from(mealPlans)
      .where(
        and(
          eq(mealPlans.userId, user.id),
          eq(mealPlans.weekStartDate, weekStartStr)
        )
      )
      .limit(1)

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'No meal plan found for this week' },
        { status: 404 }
      )
    }

    // Get all planned meals for this week
    const plannedMealsData = await db
      .select({ mealId: plannedMeals.mealId })
      .from(plannedMeals)
      .where(eq(plannedMeals.mealPlanId, mealPlan.id))

    if (plannedMealsData.length === 0) {
      return NextResponse.json(
        { error: 'No meals planned for this week' },
        { status: 400 }
      )
    }

    const mealIds = plannedMealsData.map((pm) => pm.mealId)

    // Get all ingredients for these meals
    const allIngredients = await db
      .select({
        ingredientId: mealIngredients.ingredientId,
        quantity: mealIngredients.quantity,
        unit: mealIngredients.unit,
        ingredient: ingredients,
      })
      .from(mealIngredients)
      .innerJoin(ingredients, eq(mealIngredients.ingredientId, ingredients.id))
      .where(eq(mealIngredients.mealId, mealIds[0]))

    // For multiple meals, we need to query each separately and combine
    const ingredientMap = new Map<string, { name: string, quantity: number, unit: string, category: string }>()

    for (const mealId of mealIds) {
      const mealIngs = await db
        .select({
          ingredientId: mealIngredients.ingredientId,
          quantity: mealIngredients.quantity,
          unit: mealIngredients.unit,
          ingredient: ingredients,
        })
        .from(mealIngredients)
        .innerJoin(ingredients, eq(mealIngredients.ingredientId, ingredients.id))
        .where(eq(mealIngredients.mealId, mealId))

      for (const mi of mealIngs) {
        const key = `${mi.ingredient.name}-${mi.unit}`
        const existing = ingredientMap.get(key)

        if (existing) {
          existing.quantity += Number(mi.quantity)
        } else {
          ingredientMap.set(key, {
            name: mi.ingredient.name,
            quantity: Number(mi.quantity),
            unit: mi.unit,
            category: mapIngredientCategory(mi.ingredient.category),
          })
        }
      }
    }

    // Create grocery list
    const [newGroceryList] = await db
      .insert(groceryLists)
      .values({
        userId: user.id,
        mealPlanId: mealPlan.id,
        name: `Grocery List - Week of ${format(weekStart, 'MMM dd, yyyy')}`,
      })
      .returning()

    // Add items to grocery list
    const items = Array.from(ingredientMap.values())
    if (items.length > 0) {
      await db.insert(groceryItems).values(
        items.map((item) => ({
          groceryListId: newGroceryList.id,
          itemName: item.name,
          quantity: item.quantity.toString(),
          unit: item.unit,
          category: item.category as any,
          isChecked: false,
        }))
      )
    }

    return NextResponse.json({ data: newGroceryList }, { status: 201 })
  } catch (error) {
    console.error('Generate grocery list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function mapIngredientCategory(category: string): string {
  const mapping: Record<string, string> = {
    vegetables: 'produce',
    fruits: 'produce',
    protein: 'meat',
    dairy: 'dairy',
    carbs: 'pantry',
    fats: 'pantry',
    other: 'other',
  }
  return mapping[category] || 'other'
}

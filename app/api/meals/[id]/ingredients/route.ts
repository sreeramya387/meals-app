import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { meals, mealIngredients } from '@/lib/db/schema'
import { mealIngredientSchema } from '@/lib/validation/meal'
import { calculateMealNutrition } from '@/lib/nutrition/calculator'
import { eq, and } from 'drizzle-orm'

// POST /api/meals/:id/ingredients - Add ingredient to meal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if meal exists and belongs to user
    const [meal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, params.id), eq(meals.userId, user.id)))
      .limit(1)

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = mealIngredientSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Add ingredient to meal
    const [newIngredient] = await db
      .insert(mealIngredients)
      .values({
        mealId: params.id,
        ingredientId: data.ingredientId,
        quantity: data.quantity.toString(),
        unit: data.unit,
      })
      .returning()

    // Recalculate meal nutrition
    const nutrition = await calculateMealNutrition(params.id)
    await db
      .update(meals)
      .set({
        calories: nutrition.calories.toString(),
        proteinG: nutrition.proteinG.toString(),
        carbsG: nutrition.carbsG.toString(),
        fatG: nutrition.fatG.toString(),
        updatedAt: new Date(),
      })
      .where(eq(meals.id, params.id))

    return NextResponse.json({ data: newIngredient }, { status: 201 })
  } catch (error) {
    console.error('Add ingredient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/meals/:id/ingredients/:ingredientId - Update ingredient quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ingredientEntryId, quantity, unit } = body

    if (!ingredientEntryId) {
      return NextResponse.json(
        { error: 'Ingredient entry ID is required' },
        { status: 400 }
      )
    }

    // Check meal ownership
    const [meal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, params.id), eq(meals.userId, user.id)))
      .limit(1)

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    // Update ingredient
    await db
      .update(mealIngredients)
      .set({
        quantity: quantity.toString(),
        unit,
      })
      .where(eq(mealIngredients.id, ingredientEntryId))

    // Recalculate nutrition
    const nutrition = await calculateMealNutrition(params.id)
    await db
      .update(meals)
      .set({
        calories: nutrition.calories.toString(),
        proteinG: nutrition.proteinG.toString(),
        carbsG: nutrition.carbsG.toString(),
        fatG: nutrition.fatG.toString(),
        updatedAt: new Date(),
      })
      .where(eq(meals.id, params.id))

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Update ingredient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/meals/:id/ingredients/:ingredientId - Remove ingredient from meal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ingredientEntryId = searchParams.get('ingredientEntryId')

    if (!ingredientEntryId) {
      return NextResponse.json(
        { error: 'Ingredient entry ID is required' },
        { status: 400 }
      )
    }

    // Check meal ownership
    const [meal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, params.id), eq(meals.userId, user.id)))
      .limit(1)

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    // Delete ingredient
    await db
      .delete(mealIngredients)
      .where(eq(mealIngredients.id, ingredientEntryId))

    // Recalculate nutrition
    const nutrition = await calculateMealNutrition(params.id)
    await db
      .update(meals)
      .set({
        calories: nutrition.calories.toString(),
        proteinG: nutrition.proteinG.toString(),
        carbsG: nutrition.carbsG.toString(),
        fatG: nutrition.fatG.toString(),
        updatedAt: new Date(),
      })
      .where(eq(meals.id, params.id))

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Delete ingredient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

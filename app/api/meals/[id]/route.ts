import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { meals, mealIngredients, ingredients } from '@/lib/db/schema'
import { mealSchema } from '@/lib/validation/meal'
import { eq, and } from 'drizzle-orm'

// GET /api/meals/:id - Get meal details with ingredients
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [meal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, params.id), eq(meals.userId, user.id)))
      .limit(1)

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    // Get ingredients
    const mealIngs = await db
      .select({
        id: mealIngredients.id,
        mealId: mealIngredients.mealId,
        ingredientId: mealIngredients.ingredientId,
        quantity: mealIngredients.quantity,
        unit: mealIngredients.unit,
        createdAt: mealIngredients.createdAt,
        ingredient: ingredients,
      })
      .from(mealIngredients)
      .innerJoin(ingredients, eq(mealIngredients.ingredientId, ingredients.id))
      .where(eq(mealIngredients.mealId, params.id))

    return NextResponse.json({
      data: {
        ...meal,
        ingredients: mealIngs,
      },
    })
  } catch (error) {
    console.error('Get meal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/meals/:id - Update meal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if meal exists and belongs to user
    const [existingMeal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, params.id), eq(meals.userId, user.id)))
      .limit(1)

    if (!existingMeal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = mealSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update meal
    const [updatedMeal] = await db
      .update(meals)
      .set({
        name: data.name,
        description: data.description,
        category: data.category,
        preparationTimeMinutes: data.preparationTimeMinutes,
        cookingTimeMinutes: data.cookingTimeMinutes,
        servings: data.servings,
        instructions: data.instructions,
        dietaryTags: data.dietaryTags,
        updatedAt: new Date(),
      })
      .where(eq(meals.id, params.id))
      .returning()

    return NextResponse.json({ data: updatedMeal })
  } catch (error) {
    console.error('Update meal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/meals/:id - Delete meal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if meal exists and belongs to user
    const [existingMeal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, params.id), eq(meals.userId, user.id)))
      .limit(1)

    if (!existingMeal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    // Delete meal (cascade will delete ingredients)
    await db.delete(meals).where(eq(meals.id, params.id))

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Delete meal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { meals } from '@/lib/db/schema'
import { mealSchema } from '@/lib/validation/meal'
import { eq, and, like, or } from 'drizzle-orm'

// GET /api/meals - List all user's meals with filters
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let query = db.select().from(meals).where(eq(meals.userId, user.id)).$dynamic()

    // Apply filters
    const conditions = [eq(meals.userId, user.id)]

    if (search) {
      conditions.push(like(meals.name, `%${search}%`))
    }

    if (category) {
      conditions.push(eq(meals.category, category as any))
    }

    const userMeals = await db
      .select()
      .from(meals)
      .where(and(...conditions))

    return NextResponse.json({ data: userMeals })
  } catch (error) {
    console.error('Get meals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/meals - Create a new meal
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Create meal
    const [newMeal] = await db
      .insert(meals)
      .values({
        userId: user.id,
        name: data.name,
        description: data.description,
        category: data.category,
        preparationTimeMinutes: data.preparationTimeMinutes,
        cookingTimeMinutes: data.cookingTimeMinutes,
        servings: data.servings,
        instructions: data.instructions,
        dietaryTags: data.dietaryTags,
      })
      .returning()

    return NextResponse.json({ data: newMeal }, { status: 201 })
  } catch (error) {
    console.error('Create meal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

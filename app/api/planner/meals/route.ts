import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { mealPlans, plannedMeals, meals } from '@/lib/db/schema'
import { plannedMealSchema } from '@/lib/validation/planner'
import { eq, and } from 'drizzle-orm'
import { startOfWeek, format } from 'date-fns'

// POST /api/planner/meals - Add meal to plan slot
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      console.log('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Add meal request body:', body)

    // Validate input
    const validationResult = plannedMealSchema.safeParse(body)
    if (!validationResult.success) {
      console.log('Validation error:', validationResult.error)
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { mealId, date, mealSlot } = validationResult.data
    console.log('Validated data:', { mealId, date, mealSlot })

    // Verify meal belongs to user
    const [meal] = await db
      .select()
      .from(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, user.id)))
      .limit(1)

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    // Get or create meal plan for this week
    const weekStart = startOfWeek(new Date(date), { weekStartsOn: 1 })
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')

    let [mealPlan] = await db
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
      [mealPlan] = await db
        .insert(mealPlans)
        .values({
          userId: user.id,
          weekStartDate: weekStartStr,
          name: `Week of ${format(weekStart, 'MMM dd, yyyy')}`,
        })
        .returning()
    }

    // Check if slot is already occupied
    const [existingPlannedMeal] = await db
      .select()
      .from(plannedMeals)
      .where(
        and(
          eq(plannedMeals.mealPlanId, mealPlan.id),
          eq(plannedMeals.date, date),
          eq(plannedMeals.mealSlot, mealSlot)
        )
      )
      .limit(1)

    if (existingPlannedMeal) {
      // Update existing slot
      console.log('Updating existing slot:', existingPlannedMeal.id)
      const [updated] = await db
        .update(plannedMeals)
        .set({ mealId })
        .where(eq(plannedMeals.id, existingPlannedMeal.id))
        .returning()

      console.log('Slot updated successfully:', updated)
      return NextResponse.json({ data: updated })
    } else {
      // Create new planned meal
      console.log('Creating new planned meal in slot')
      const [newPlannedMeal] = await db
        .insert(plannedMeals)
        .values({
          mealPlanId: mealPlan.id,
          mealId,
          date,
          mealSlot,
        })
        .returning()

      console.log('Planned meal created successfully:', newPlannedMeal)
      return NextResponse.json({ data: newPlannedMeal }, { status: 201 })
    }
  } catch (error) {
    console.error('Add planned meal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/planner/meals/:id - Remove meal from slot
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const plannedMealId = searchParams.get('id')

    if (!plannedMealId) {
      return NextResponse.json(
        { error: 'Planned meal ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership through meal plan
    const [plannedMeal] = await db
      .select({
        plannedMeal: plannedMeals,
        mealPlan: mealPlans,
      })
      .from(plannedMeals)
      .innerJoin(mealPlans, eq(plannedMeals.mealPlanId, mealPlans.id))
      .where(eq(plannedMeals.id, plannedMealId))
      .limit(1)

    if (!plannedMeal || plannedMeal.mealPlan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Planned meal not found' },
        { status: 404 }
      )
    }

    // Delete planned meal
    await db.delete(plannedMeals).where(eq(plannedMeals.id, plannedMealId))

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Delete planned meal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

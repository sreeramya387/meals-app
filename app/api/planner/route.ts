import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { mealPlans, plannedMeals, meals } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { startOfWeek, endOfWeek, format } from 'date-fns'

// GET /api/planner?week=2024-01-15 - Get meal plan for specific week
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get('week')

    console.log('GET /api/planner - weekParam:', weekParam)

    // Parse week start date - use the provided date directly as the week start
    // The frontend already calculates the Monday, so we just use it
    const weekStartStr = weekParam || format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    
    // For calculating week end, parse the date and get the Sunday
    const weekStartDate = new Date(weekStartStr + 'T12:00:00') // Use noon to avoid timezone issues
    const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 })
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

    console.log('Using week start:', weekStartStr)
    console.log('Week end:', weekEndStr)
    console.log('Looking for meal plan with weekStartDate:', weekStartStr)

    // Find or create meal plan for this week
   const existingPlans = await db
  .select()
  .from(mealPlans)
  .where(
    and(
      eq(mealPlans.userId, user.id),
      eq(mealPlans.weekStartDate, weekStartStr)
    )
  )
  .limit(1)

let mealPlan = existingPlans[0]

if (!mealPlan) {
  console.log('Creating new meal plan for week:', weekStartStr)
  const inserted = await db
    .insert(mealPlans)
    .values({
      userId: user.id,
      weekStartDate: weekStartStr,
      name: `Week of ${format(weekStartDate, 'MMM dd, yyyy')}`,  // ✅ fixed: weekStart → weekStartDate
    })
    .returning()
  mealPlan = inserted[0]
  console.log('Created meal plan:', mealPlan)
} else {
  console.log('Found existing meal plan:', mealPlan.id, 'for week:', mealPlan.weekStartDate)
}

    // Get all planned meals for this week
    const plannedMealsData = await db
      .select({
        id: plannedMeals.id,
        mealPlanId: plannedMeals.mealPlanId,
        mealId: plannedMeals.mealId,
        date: plannedMeals.date,
        mealSlot: plannedMeals.mealSlot,
        createdAt: plannedMeals.createdAt,
        meal: meals,
      })
      .from(plannedMeals)
      .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
      .where(eq(plannedMeals.mealPlanId, mealPlan.id))

    console.log(`Returning ${plannedMealsData.length} planned meals for week ${weekStartStr}`)
    if (plannedMealsData.length > 0) {
      console.log('Sample planned meal:', plannedMealsData[0])
    }

    return NextResponse.json({
      data: {
        mealPlan,
        plannedMeals: plannedMealsData,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
      },
    })
  } catch (error) {
    console.error('Get planner error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { mealPlans, plannedMeals, meals } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { startOfWeek, endOfWeek, format, addDays, eachDayOfInterval } from 'date-fns'

// GET /api/planner/nutrition?week=2024-01-15 - Get weekly nutrition summary
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get('week')

    // Parse week dates - use the provided date directly as the week start
    const weekStartStr = weekParam || format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const weekStartDate = new Date(weekStartStr + 'T12:00:00')
    const weekStart = weekStartDate
    const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 })

    // Get meal plan
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
      return NextResponse.json({
        data: {
          days: [],
          weeklyAverage: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        },
      })
    }

    // Get all planned meals with meal details
    const plannedMealsData = await db
      .select({
        date: plannedMeals.date,
        meal: meals,
      })
      .from(plannedMeals)
      .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
      .where(eq(plannedMeals.mealPlanId, mealPlan.id))

    // Calculate daily nutrition
    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const dailyNutrition = allDays.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayMeals = plannedMealsData.filter((pm) => pm.date === dayStr)

      const totals = dayMeals.reduce(
        (acc, pm) => ({
          calories: acc.calories + Number(pm.meal.calories),
          proteinG: acc.proteinG + Number(pm.meal.proteinG),
          carbsG: acc.carbsG + Number(pm.meal.carbsG),
          fatG: acc.fatG + Number(pm.meal.fatG),
        }),
        { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
      )

      return {
        date: dayStr,
        ...totals,
      }
    })

    // Calculate weekly average
    const weeklyTotals = dailyNutrition.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        proteinG: acc.proteinG + day.proteinG,
        carbsG: acc.carbsG + day.carbsG,
        fatG: acc.fatG + day.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    )

    const weeklyAverage = {
      calories: Math.round(weeklyTotals.calories / 7),
      proteinG: Math.round((weeklyTotals.proteinG / 7) * 10) / 10,
      carbsG: Math.round((weeklyTotals.carbsG / 7) * 10) / 10,
      fatG: Math.round((weeklyTotals.fatG / 7) * 10) / 10,
    }

    return NextResponse.json({
      data: {
        days: dailyNutrition,
        weeklyAverage,
      },
    })
  } catch (error) {
    console.error('Get nutrition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

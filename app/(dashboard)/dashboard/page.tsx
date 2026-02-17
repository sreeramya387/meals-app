import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { meals, mealPlans, plannedMeals } from '@/lib/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils, Calendar, ShoppingCart, Plus } from 'lucide-react'
import { startOfWeek, endOfWeek } from 'date-fns'

async function getDashboardData(userId: string) {
  // Get total meals count
  const userMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.userId, userId))

  // Get current week's meal plan
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const currentWeekPlan = await db
    .select()
    .from(mealPlans)
    .where(
      and(
        eq(mealPlans.userId, userId),
        eq(mealPlans.weekStartDate, weekStart.toISOString().split('T')[0])
      )
    )
    .limit(1)

  let weekCalories = 0
  if (currentWeekPlan.length > 0) {
    const plannedMealsData = await db
      .select({
        meal: meals,
      })
      .from(plannedMeals)
      .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
      .where(eq(plannedMeals.mealPlanId, currentWeekPlan[0].id))

    weekCalories = plannedMealsData.reduce(
      (sum, pm) => sum + Number(pm.meal.calories),
      0
    )
  }

  // Get recent meals
  const recentMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.userId, userId))
    .orderBy(desc(meals.createdAt))
    .limit(5)

  return {
    totalMeals: userMeals.length,
    weekCalories,
    recentMeals,
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = token ? await getUserFromSession(token) : null

  if (!user) {
    return null
  }

  const data = await getDashboardData(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your meal planning
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMeals}</div>
            <p className="text-xs text-muted-foreground">
              Meals in your collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.weekCalories > 0 ? `${Math.round(data.weekCalories)} cal` : 'Not planned'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total calories planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Get started with planning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/planner">
          <Button className="w-full h-20 text-lg" size="lg">
            <Calendar className="mr-2 h-5 w-5" />
            Plan This Week
          </Button>
        </Link>
        <Link href="/meals/new">
          <Button className="w-full h-20 text-lg" variant="outline" size="lg">
            <Utensils className="mr-2 h-5 w-5" />
            Add New Meal
          </Button>
        </Link>
        <Link href="/grocery">
          <Button className="w-full h-20 text-lg" variant="outline" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            View Grocery List
          </Button>
        </Link>
      </div>

      {/* Recent Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meals</CardTitle>
          <CardDescription>
            Your last {data.recentMeals.length} created meals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meals yet. Create your first meal to get started!</p>
              <Link href="/meals/new">
                <Button className="mt-4">Create Meal</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentMeals.map((meal) => (
                <Link
                  key={meal.id}
                  href={`/meals/${meal.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div>
                    <h3 className="font-medium">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {meal.category} • {Number(meal.calories).toFixed(0)} cal
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {meal.preparationTimeMinutes + meal.cookingTimeMinutes} min
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

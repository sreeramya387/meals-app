import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { meals } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Users } from 'lucide-react'

async function getUserMeals(userId: string) {
  return await db
    .select()
    .from(meals)
    .where(eq(meals.userId, userId))
    .orderBy(desc(meals.createdAt))
}

export default async function MealsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = token ? await getUserFromSession(token) : null

  if (!user) {
    return null
  }

  const userMeals = await getUserMeals(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Meals</h1>
          <p className="text-muted-foreground mt-2">
            Manage your meal collection
          </p>
        </div>
        <Link href="/meals/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Meal
          </Button>
        </Link>
      </div>

      {userMeals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">No meals yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first meal to start planning
              </p>
              <Link href="/meals/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Meal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userMeals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{meal.name}</CardTitle>
                      <CardDescription className="mt-1 capitalize">
                        {meal.category}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meal.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{meal.preparationTimeMinutes + meal.cookingTimeMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{meal.servings} servings</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm font-semibold">
                        {Number(meal.calories).toFixed(0)} calories
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        P: {Number(meal.proteinG).toFixed(0)}g • 
                        C: {Number(meal.carbsG).toFixed(0)}g • 
                        F: {Number(meal.fatG).toFixed(0)}g
                      </div>
                    </div>

                    {meal.dietaryTags && meal.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {meal.dietaryTags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {meal.dietaryTags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{meal.dietaryTags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

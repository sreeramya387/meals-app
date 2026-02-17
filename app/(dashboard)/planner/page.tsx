'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { format, addWeeks, startOfWeek, addDays, isSameDay } from 'date-fns'

interface Meal {
  id: string
  name: string
  category: string
  calories: string
  proteinG: string
  carbsG: string
  fatG: string
}

interface PlannedMeal {
  id: string
  mealId: string
  date: string
  mealSlot: string
  meal: Meal
}

interface DayNutrition {
  date: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

const mealSlots = ['breakfast', 'lunch', 'dinner'] as const

export default function PlannerPage() {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date()
    console.log('Initializing currentWeek with:', now)
    return now
  })
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([])
  const [nutrition, setNutrition] = useState<{ days: DayNutrition[], weeklyAverage: any }>({ days: [], weeklyAverage: {} })
  const [loading, setLoading] = useState(true)
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string, slot: string } | null>(null)
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([])
  const [mealSearch, setMealSearch] = useState('')
  const [addingMeal, setAddingMeal] = useState(false)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  console.log('Render - currentWeek:', currentWeek)
  console.log('Render - weekStart:', weekStart)
  console.log('Render - weekDays:', weekDays.map(d => format(d, 'yyyy-MM-dd')))

  useEffect(() => {
    console.log('useEffect triggered - currentWeek changed:', currentWeek)
    fetchPlan()
    fetchNutrition()
    fetchAvailableMeals()
  }, [currentWeek])

  useEffect(() => {
    console.log('plannedMeals state updated:', plannedMeals.length, 'meals')
    if (plannedMeals.length > 0) {
      console.log('Planned meals:', plannedMeals.map(pm => `${pm.date} ${pm.mealSlot} - ${pm.meal.name}`))
    }
  }, [plannedMeals])

  const fetchPlan = async () => {
    try {
      const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const weekStr = format(currentWeekStart, 'yyyy-MM-dd')
      console.log('Current week state:', currentWeek)
      console.log('Calculated week start:', currentWeekStart)
      console.log('Fetching plan for week:', weekStr)
      
      const url = `/api/planner?week=${weekStr}&t=${Date.now()}`
      console.log('Fetch URL:', url)
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      const data = await response.json()

      console.log('Fetched plan data:', data)

      if (response.ok) {
        const meals = data.data.plannedMeals || []
        console.log('Setting planned meals:', meals.length, 'meals found')
        console.log('Planned meals details:', meals)
        setPlannedMeals(meals)
      }
    } catch (err) {
      console.error('Failed to fetch plan:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNutrition = async () => {
    try {
      const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const weekStr = format(currentWeekStart, 'yyyy-MM-dd')
      
      const response = await fetch(`/api/planner/nutrition?week=${weekStr}`)
      const data = await response.json()

      if (response.ok) {
        setNutrition(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch nutrition:', err)
    }
  }

  const fetchAvailableMeals = async () => {
    try {
      const response = await fetch('/api/meals')
      const data = await response.json()

      if (response.ok) {
        setAvailableMeals(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch meals:', err)
    }
  }

  const handleAddMeal = async (mealId: string) => {
    if (!selectedSlot) {
      console.error('No slot selected')
      return
    }

    console.log('Adding meal:', { mealId, date: selectedSlot.date, slot: selectedSlot.slot })
    setAddingMeal(true)

    try {
      const response = await fetch('/api/planner/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealId,
          date: selectedSlot.date,
          mealSlot: selectedSlot.slot,
        }),
      })

      const data = await response.json()
      console.log('Add meal response:', data)

      if (response.ok) {
        console.log('Meal added successfully, refreshing...')
        
        // Close dialog first
        setAddMealDialogOpen(false)
        setSelectedSlot(null)
        setMealSearch('')
        
        // Then refresh data
        await Promise.all([fetchPlan(), fetchNutrition()])
        
        console.log('Refresh complete')
      } else {
        console.error('Failed to add meal:', data.error)
        alert(data.error || 'Failed to add meal to calendar')
      }
    } catch (err) {
      console.error('Failed to add meal:', err)
      alert('An error occurred while adding the meal')
    } finally {
      setAddingMeal(false)
    }
  }

  const handleRemoveMeal = async (plannedMealId: string) => {
    try {
      const response = await fetch(`/api/planner/meals?id=${plannedMealId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPlan()
        fetchNutrition()
      }
    } catch (err) {
      console.error('Failed to remove meal:', err)
    }
  }

  const getMealForSlot = (date: Date, slot: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const found = plannedMeals.find(
      (pm) => pm.date === dateStr && pm.mealSlot === slot
    )
    if (!found && plannedMeals.length > 0) {
      console.log(`Looking for meal on ${dateStr} ${slot}, but not found. Available meals:`, plannedMeals.map(pm => `${pm.date} ${pm.mealSlot}`))
    }
    return found
  }

  const getDayNutrition = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return nutrition.days.find((d) => d.date === dateStr) || {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    }
  }

  const filteredMeals = availableMeals.filter((meal) =>
    meal.name.toLowerCase().includes(mealSearch.toLowerCase())
  )

  const isToday = (date: Date) => isSameDay(date, new Date())

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Meal Planner</h1>
          <p className="text-muted-foreground mt-2">
            Plan your meals for the week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-[200px] text-center">
            {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCurrentWeek(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nutrition.weeklyAverage.calories || 0}</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Protein</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nutrition.weeklyAverage.proteinG || 0}g</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Carbs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nutrition.weeklyAverage.carbsG || 0}g</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Fat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nutrition.weeklyAverage.fatG || 0}g</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayNutrition = getDayNutrition(day)
          const today = isToday(day)

          return (
            <Card key={day.toString()} className={today ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center justify-between">
                    <span>{format(day, 'EEE')}</span>
                    {today && <Badge variant="default" className="text-xs">Today</Badge>}
                  </div>
                  <div className="text-lg">{format(day, 'dd')}</div>
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {dayNutrition.calories.toFixed(0)} cal
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealSlots.map((slot) => {
                  const plannedMeal = getMealForSlot(day, slot)
                  const dateStr = format(day, 'yyyy-MM-dd')

                  return (
                    <div key={slot} className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground capitalize">
                        {slot}
                      </div>
                      {plannedMeal ? (
                        <div className="relative group">
                          <div className="p-2 bg-primary/10 rounded-md text-xs">
                            <div className="font-medium line-clamp-2 pr-6">
                              {plannedMeal.meal.name}
                            </div>
                            <div className="text-muted-foreground mt-1">
                              {Number(plannedMeal.meal.calories).toFixed(0)} cal
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveMeal(plannedMeal.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-16 border-dashed"
                          onClick={() => {
                            setSelectedSlot({ date: dateStr, slot })
                            setAddMealDialogOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Meal</DialogTitle>
            <DialogDescription>
              Select from your meals to add to <span className="capitalize font-medium">{selectedSlot?.slot}</span> on{' '}
              {selectedSlot && format(new Date(selectedSlot.date), 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {addingMeal && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Adding meal to calendar...</p>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Input
                placeholder="Filter by name (optional)..."
                value={mealSearch}
                onChange={(e) => setMealSearch(e.target.value)}
                className="pr-10"
              />
              {mealSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setMealSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Meal Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {filteredMeals.length} meal{filteredMeals.length !== 1 ? 's' : ''} available
                {mealSearch && ` (filtered from ${availableMeals.length})`}
              </span>
            </div>

            {/* Meals List */}
            {availableMeals.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-4xl mb-4">🍽️</div>
                  <p className="text-muted-foreground text-center mb-4">
                    No meals created yet!
                  </p>
                  <Button asChild variant="outline">
                    <a href="/meals/new" target="_blank">
                      Create Your First Meal
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : filteredMeals.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center mb-4">
                    No meals match "{mealSearch}"
                  </p>
                  <Button variant="outline" onClick={() => setMealSearch('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {/* Group by category */}
                {['breakfast', 'lunch', 'dinner', 'snack'].map((category) => {
                  const categoryMeals = filteredMeals.filter(m => m.category === category)
                  if (categoryMeals.length === 0) return null

                  return (
                    <div key={category} className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                        {category} ({categoryMeals.length})
                      </div>
                      {categoryMeals.map((meal) => (
                        <button
                          key={meal.id}
                          className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:border-primary transition-all text-left group"
                          onClick={() => handleAddMeal(meal.id)}
                          disabled={addingMeal}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-base truncate">{meal.name}</div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="text-sm font-semibold text-primary">
                                {Number(meal.calories).toFixed(0)} cal
                              </div>
                              <div className="text-xs text-muted-foreground">
                                P: {Number(meal.proteinG).toFixed(0)}g
                              </div>
                              <div className="text-xs text-muted-foreground">
                                C: {Number(meal.carbsG).toFixed(0)}g
                              </div>
                              <div className="text-xs text-muted-foreground">
                                F: {Number(meal.fatG).toFixed(0)}g
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                              <Plus className="h-5 w-5" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

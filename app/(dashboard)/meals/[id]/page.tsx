'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Clock, Users } from 'lucide-react'

const categories = ['breakfast', 'lunch', 'dinner', 'snack']
const dietaryTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo']
const units = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece']

interface Ingredient {
  id: string
  name: string
  category: string
  caloriesPer100g: string
  proteinPer100g: string
  carbsPer100g: string
  fatPer100g: string
}

interface MealIngredient {
  id: string
  quantity: string
  unit: string
  ingredient: Ingredient
}

interface Meal {
  id: string
  name: string
  description?: string
  category: string
  preparationTimeMinutes: number
  cookingTimeMinutes: number
  servings: number
  instructions?: string
  dietaryTags: string[]
  calories: string
  proteinG: string
  carbsG: string
  fatG: string
  ingredients: MealIngredient[]
}

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addIngredientOpen, setAddIngredientOpen] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Ingredient[]>([])
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [ingredientQuantity, setIngredientQuantity] = useState('100')
  const [ingredientUnit, setIngredientUnit] = useState('g')
  const [manualMode, setManualMode] = useState(false)
  const [manualIngredient, setManualIngredient] = useState({
    name: '',
    calories: '0',
    protein: '0',
    carbs: '0',
    fat: '0',
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'lunch',
    preparationTimeMinutes: 0,
    cookingTimeMinutes: 0,
    servings: 2,
    instructions: '',
    dietaryTags: [] as string[],
  })

  useEffect(() => {
    fetchMeal()
  }, [params.id])

  useEffect(() => {
    if (ingredientSearch.length >= 2) {
      searchIngredients()
    } else {
      setSearchResults([])
    }
  }, [ingredientSearch])

  const fetchMeal = async () => {
    try {
      const response = await fetch(`/api/meals/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setMeal(data.data)
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
          category: data.data.category,
          preparationTimeMinutes: data.data.preparationTimeMinutes,
          cookingTimeMinutes: data.data.cookingTimeMinutes,
          servings: data.data.servings,
          instructions: data.data.instructions || '',
          dietaryTags: data.data.dietaryTags || [],
        })
      } else {
        setError('Meal not found')
      }
    } catch (err) {
      setError('Failed to load meal')
    } finally {
      setLoading(false)
    }
  }

  const searchIngredients = async () => {
    try {
      const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(ingredientSearch)}`)
      const data = await response.json()
      if (response.ok) {
        setSearchResults(data.data)
      }
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/meals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMeal({ ...meal!, ...data.data })
        setEditing(false)
      } else {
        setError(data.error || 'Failed to update meal')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/meals/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/meals')
      } else {
        setError('Failed to delete meal')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleAddIngredient = async () => {
    try {
      let ingredientId = selectedIngredient?.id

      // If manual mode, create the ingredient first
      if (manualMode) {
        if (!manualIngredient.name) return

        const createResponse = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: manualIngredient.name,
            category: 'other',
            caloriesPer100g: parseFloat(manualIngredient.calories) || 0,
            proteinPer100g: parseFloat(manualIngredient.protein) || 0,
            carbsPer100g: parseFloat(manualIngredient.carbs) || 0,
            fatPer100g: parseFloat(manualIngredient.fat) || 0,
          }),
        })

        if (!createResponse.ok) {
          alert('Failed to create ingredient')
          return
        }

        const createData = await createResponse.json()
        ingredientId = createData.data.id
      }

      if (!ingredientId) return

      // Add ingredient to meal
      const response = await fetch(`/api/meals/${params.id}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId,
          quantity: parseFloat(ingredientQuantity),
          unit: ingredientUnit,
        }),
      })

      if (response.ok) {
        setAddIngredientOpen(false)
        setSelectedIngredient(null)
        setIngredientSearch('')
        setIngredientQuantity('100')
        setIngredientUnit('g')
        setManualMode(false)
        setManualIngredient({ name: '', calories: '0', protein: '0', carbs: '0', fat: '0' })
        fetchMeal()
      }
    } catch (err) {
      console.error('Failed to add ingredient:', err)
    }
  }

  const handleRemoveIngredient = async (ingredientEntryId: string) => {
    try {
      const response = await fetch(
        `/api/meals/${params.id}/ingredients?ingredientEntryId=${ingredientEntryId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        fetchMeal()
      }
    } catch (err) {
      console.error('Failed to remove ingredient:', err)
    }
  }

  const toggleDietaryTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }))
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  if (error && !meal) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">{error}</p>
        <Link href="/meals">
          <Button className="mt-4">Back to Meals</Button>
        </Link>
      </div>
    )
  }

  if (!meal) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/meals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{editing ? 'Edit Meal' : meal.name}</h1>
            <p className="text-muted-foreground mt-1 capitalize">
              {meal.category}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button onClick={() => setEditing(true)} variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => setDeleteDialogOpen(true)} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleUpdate} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={() => setEditing(false)} variant="outline" disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(meal.calories).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">per serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meal.preparationTimeMinutes + meal.cookingTimeMinutes} min
            </div>
            <p className="text-xs text-muted-foreground">
              Prep: {meal.preparationTimeMinutes}m • Cook: {meal.cookingTimeMinutes}m
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Servings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meal.servings}</div>
            <p className="text-xs text-muted-foreground">portions</p>
          </CardContent>
        </Card>
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Meal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Servings</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prep Time (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.preparationTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Cook Time (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.cookingTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, cookingTimeMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
              />
            </div>

            <div className="space-y-3">
              <Label>Dietary Tags</Label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${tag}`}
                      checked={formData.dietaryTags.includes(tag)}
                      onCheckedChange={() => toggleDietaryTag(tag)}
                    />
                    <Label htmlFor={`edit-${tag}`} className="text-sm font-normal capitalize cursor-pointer">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {meal.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{meal.description}</p>
              </CardContent>
            </Card>
          )}

          {meal.dietaryTags && meal.dietaryTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dietary Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {meal.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button onClick={() => setAddIngredientOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {meal.ingredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No ingredients added yet</p>
              <Button onClick={() => setAddIngredientOpen(true)} variant="outline" className="mt-4">
                Add Your First Ingredient
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {meal.ingredients.map((mi) => (
                <div key={mi.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{mi.ingredient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {Number(mi.quantity).toFixed(1)} {mi.unit}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIngredient(mi.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition Facts</CardTitle>
          <CardDescription>Per serving</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Calories</div>
              <div className="text-2xl font-bold">{Number(meal.calories).toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Protein</div>
              <div className="text-2xl font-bold">{Number(meal.proteinG).toFixed(0)}g</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Carbs</div>
              <div className="text-2xl font-bold">{Number(meal.carbsG).toFixed(0)}g</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fat</div>
              <div className="text-2xl font-bold">{Number(meal.fatG).toFixed(0)}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {meal.instructions && !editing && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{meal.instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{meal.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Ingredient Dialog */}
      <Dialog open={addIngredientOpen} onOpenChange={(open) => {
        setAddIngredientOpen(open)
        if (!open) {
          setManualMode(false)
          setSelectedIngredient(null)
          setIngredientSearch('')
          setManualIngredient({ name: '', calories: '0', protein: '0', carbs: '0', fat: '0' })
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
            <DialogDescription>
              {manualMode ? 'Manually enter ingredient details' : 'Search from database or add manually'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Toggle between search and manual */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={!manualMode ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setManualMode(false)}
            >
              Search Database
            </Button>
            <Button
              variant={manualMode ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setManualMode(true)}
            >
              Add Manually
            </Button>
          </div>

          <div className="space-y-4">
            {!manualMode ? (
              /* Search Mode */
              <>
                <div className="space-y-2">
                  <Label>Search Ingredient</Label>
                  <Input
                    placeholder="Type to search (e.g., chicken, rice, tomato)..."
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {searchResults.map((ingredient) => (
                        <button
                          key={ingredient.id}
                          className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                          onClick={() => {
                            setSelectedIngredient(ingredient)
                            setSearchResults([])
                            setIngredientSearch(ingredient.name)
                          }}
                        >
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {ingredient.category}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {ingredientSearch.length >= 2 && searchResults.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No results found. Try switching to "Add Manually" mode.
                    </p>
                  )}
                </div>

                {selectedIngredient && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={ingredientQuantity}
                          onChange={(e) => setIngredientQuantity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select value={ingredientUnit} onValueChange={setIngredientUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Nutrition (per 100g):</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Calories</div>
                          <div className="font-medium">{Number(selectedIngredient.caloriesPer100g).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Protein</div>
                          <div className="font-medium">{Number(selectedIngredient.proteinPer100g).toFixed(1)}g</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Carbs</div>
                          <div className="font-medium">{Number(selectedIngredient.carbsPer100g).toFixed(1)}g</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Fat</div>
                          <div className="font-medium">{Number(selectedIngredient.fatPer100g).toFixed(1)}g</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Manual Mode */
              <>
                <div className="space-y-2">
                  <Label>Ingredient Name *</Label>
                  <Input
                    placeholder="e.g., Olive Oil, Custom Spice Mix"
                    value={manualIngredient.name}
                    onChange={(e) => setManualIngredient({ ...manualIngredient, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <Select value={ingredientUnit} onValueChange={setIngredientUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-base">Nutrition per 100g (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Enter nutritional values if you want accurate calculations
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Calories</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={manualIngredient.calories}
                        onChange={(e) => setManualIngredient({ ...manualIngredient, calories: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={manualIngredient.protein}
                        onChange={(e) => setManualIngredient({ ...manualIngredient, protein: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbs (g)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={manualIngredient.carbs}
                        onChange={(e) => setManualIngredient({ ...manualIngredient, carbs: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fat (g)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={manualIngredient.fat}
                        onChange={(e) => setManualIngredient({ ...manualIngredient, fat: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddIngredientOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddIngredient} 
              disabled={manualMode ? !manualIngredient.name : !selectedIngredient}
            >
              Add Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

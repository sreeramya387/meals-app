export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner'
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'keto' | 'paleo'
export type IngredientCategory = 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'fats' | 'other'
export type GroceryCategory = 'produce' | 'meat' | 'dairy' | 'pantry' | 'other'
export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'piece'
export type PreferredUnits = 'metric' | 'imperial'

export interface User {
  id: string
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  preferredUnits: PreferredUnits
  emailNotifications: boolean
  marketingEmails: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Meal {
  id: string
  userId: string
  name: string
  description?: string
  category: MealCategory
  preparationTimeMinutes: number
  cookingTimeMinutes: number
  servings: number
  instructions?: string
  dietaryTags: DietaryTag[]
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  createdAt: Date
  updatedAt: Date
}

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  createdAt: Date
}

export interface MealIngredient {
  id: string
  mealId: string
  ingredientId: string
  quantity: number
  unit: Unit
  createdAt: Date
}

export interface MealPlan {
  id: string
  userId: string
  weekStartDate: Date
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface PlannedMeal {
  id: string
  mealPlanId: string
  mealId: string
  date: Date
  mealSlot: MealSlot
  createdAt: Date
}

export interface GroceryList {
  id: string
  userId: string
  mealPlanId?: string
  name: string
  createdAt: Date
}

export interface GroceryItem {
  id: string
  groceryListId: string
  itemName: string
  quantity: number
  unit: string
  category: GroceryCategory
  isChecked: boolean
  createdAt: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
}

// Extended types with relations
export interface MealWithIngredients extends Meal {
  ingredients: (MealIngredient & { ingredient: Ingredient })[]
}

export interface PlannedMealWithDetails extends PlannedMeal {
  meal: MealWithIngredients
}

export interface MealPlanWithMeals extends MealPlan {
  plannedMeals: PlannedMealWithDetails[]
}

export interface DayNutrition {
  date: Date
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface WeekNutrition {
  days: DayNutrition[]
  weeklyAverage: {
    calories: number
    proteinG: number
    carbsG: number
    fatG: number
  }
}

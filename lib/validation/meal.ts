import { z } from 'zod'

export const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  category: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  preparationTimeMinutes: z.number().int().min(0).default(0),
  cookingTimeMinutes: z.number().int().min(0).default(0),
  servings: z.number().int().min(1).default(2),
  instructions: z.string().optional(),
  dietaryTags: z.array(z.enum(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'])).default([]),
})

export const mealIngredientSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece']),
})

export type MealInput = z.infer<typeof mealSchema>
export type MealIngredientInput = z.infer<typeof mealIngredientSchema>

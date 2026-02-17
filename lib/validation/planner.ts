import { z } from 'zod'

export const plannedMealSchema = z.object({
  mealId: z.string().uuid('Invalid meal ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  mealSlot: z.enum(['breakfast', 'lunch', 'dinner']),
})

export type PlannedMealInput = z.infer<typeof plannedMealSchema>

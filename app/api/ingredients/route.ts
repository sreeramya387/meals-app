import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ingredients } from '@/lib/db/schema'
import { z } from 'zod'

const createIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'other']),
  caloriesPer100g: z.number().min(0),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
})

// POST /api/ingredients - Create a new ingredient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createIngredientSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create ingredient
    const [newIngredient] = await db
      .insert(ingredients)
      .values({
        name: data.name,
        category: data.category,
        caloriesPer100g: data.caloriesPer100g.toString(),
        proteinPer100g: data.proteinPer100g.toString(),
        carbsPer100g: data.carbsPer100g.toString(),
        fatPer100g: data.fatPer100g.toString(),
      })
      .returning()

    return NextResponse.json({ data: newIngredient }, { status: 201 })
  } catch (error) {
    console.error('Create ingredient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

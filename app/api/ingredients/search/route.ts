import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ingredients } from '@/lib/db/schema'
import { like, or } from 'drizzle-orm'

// GET /api/ingredients/search?q=chicken - Search ingredients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] })
    }

    const results = await db
      .select()
      .from(ingredients)
      .where(like(ingredients.name, `%${query}%`))
      .limit(20)

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Search ingredients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

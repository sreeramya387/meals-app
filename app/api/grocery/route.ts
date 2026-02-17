import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { groceryLists, groceryItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/grocery - Get user's grocery lists
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lists = await db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.userId, user.id))
      .orderBy(desc(groceryLists.createdAt))

    return NextResponse.json({ data: lists })
  } catch (error) {
    console.error('Get grocery lists error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

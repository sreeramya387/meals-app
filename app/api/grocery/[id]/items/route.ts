import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { groceryLists, groceryItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// PUT /api/grocery/:id/items - Update item (check/uncheck)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, isChecked } = body

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Verify list ownership
    const [list] = await db
      .select()
      .from(groceryLists)
      .where(and(eq(groceryLists.id, params.id), eq(groceryLists.userId, user.id)))
      .limit(1)

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Update item
    await db
      .update(groceryItems)
      .set({ isChecked })
      .where(eq(groceryItems.id, itemId))

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Update grocery item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

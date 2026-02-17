import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { groceryLists, groceryItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/grocery/:id - Get grocery list with items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [list] = await db
      .select()
      .from(groceryLists)
      .where(and(eq(groceryLists.id, params.id), eq(groceryLists.userId, user.id)))
      .limit(1)

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const items = await db
      .select()
      .from(groceryItems)
      .where(eq(groceryItems.groceryListId, params.id))

    return NextResponse.json({ data: { ...list, items } })
  } catch (error) {
    console.error('Get grocery list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/grocery/:id - Delete grocery list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [list] = await db
      .select()
      .from(groceryLists)
      .where(and(eq(groceryLists.id, params.id), eq(groceryLists.userId, user.id)))
      .limit(1)

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    await db.delete(groceryLists).where(eq(groceryLists.id, params.id))

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Delete grocery list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

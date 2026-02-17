import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({ data: { success: true } })
    
    // Clear auth cookie
    response.cookies.delete('auth_token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

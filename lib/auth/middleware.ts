import { NextRequest } from 'next/server'
import { getUserFromSession } from './session'

export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return { user: null, error: 'Unauthorized' }
  }

  const user = await getUserFromSession(token)

  if (!user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}

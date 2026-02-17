import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { sessions, users } from '@/lib/db/schema'
import { eq, lt } from 'drizzle-orm'
import { SignOptions } from 'jsonwebtoken'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']

interface JWTPayload {
  userId: string
  sessionId: string
}

export async function createSession(userId: string): Promise<string> {
  // Create session expiry (7 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Generate JWT token
  const sessionId = crypto.randomUUID()
  const token = jwt.sign(
    { userId, sessionId } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  // Store session in database
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
  })

  return token
}

export async function verifySession(token: string): Promise<string | null> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Check if session exists and is not expired
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, decoded.sessionId))
      .limit(1)

    if (!session) {
      return null
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      // Delete expired session
      await db.delete(sessions).where(eq(sessions.id, decoded.sessionId))
      return null
    }

    return session.userId
  } catch (error) {
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    await db.delete(sessions).where(eq(sessions.id, decoded.sessionId))
  } catch (error) {
    // Ignore errors during logout
  }
}

export async function getUserFromSession(token: string) {
  const userId = await verifySession(token)
  if (!userId) {
    return null
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user || null
}

// Cleanup expired sessions (should be run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))}

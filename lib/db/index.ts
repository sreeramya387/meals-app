import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString: DATABASE_URL || '' })

export const db = drizzle(pool, { schema })

export type DbClient = typeof db

import { drizzle } from 'drizzle-orm/neon-serverless'
import { neonConfig, Pool } from '@neondatabase/serverless'
import * as schema from './schema'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create connection pool
const pool = new Pool({ connectionString: DATABASE_URL || '' })

// Create drizzle instance with schema
export const db = drizzle(pool, { schema })

export type DbClient = typeof db

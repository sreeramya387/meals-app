import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import * as schema from './schema'

const createDb = () => {
  const url = process.env.DATABASE_URL!
  const pool = new Pool({ connectionString: url })
  return drizzle(pool, { schema })
}

export const db = createDb()

export type DbClient = typeof db

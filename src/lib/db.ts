import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../db/schema'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({
  connectionString,
  // Disable prepared statements for Next.js compatibility
  statement_timeout: 10000,
  connectionTimeoutMillis: 10000,
})

export const db = drizzle(pool, { schema })

import { createClient } from '@libsql/client'
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import 'server-only'
import * as schema from './schema'
const client = createClient({
	url: process.env.TURSO_CONNECTION_URL || 'file:db.db',
	authToken: process.env.TURSO_AUTH_TOKEN! || '',
})

export const db = drizzle(client, { schema })

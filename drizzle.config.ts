import 'dotenv/config'
import type { Config } from 'drizzle-kit'
console.log({
	url: process.env.TURSO_CONNECTION_URL || 'file:db.db',
	authToken: process.env.TURSO_AUTH_TOKEN! || '',
})
export default {
	schema: './src/db/schema.ts',
	out: './migrations',
	driver: 'turso',
	dbCredentials: {
		url: process.env.TURSO_CONNECTION_URL || 'file:db.db',
		authToken: process.env.TURSO_AUTH_TOKEN! || '',
	},
} satisfies Config

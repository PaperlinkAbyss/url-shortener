import { db } from '@/db/db'
import { sessionTable, users } from '@/db/schema'
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { Lucia } from 'lucia'
import 'server-only'

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, users)

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === 'production',
		},
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
		}
	},
})
// IMPORTANT!
declare module 'lucia' {
	interface Register {
		Lucia: typeof adapter
		UserId: number
		DatabaseUserAttributes: DatabaseUserAttributes
	}
}
interface DatabaseUserAttributes {
	username: string
	githubId: number
}

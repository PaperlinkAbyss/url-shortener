import { db } from '@/db/db'
import { InsertUsersSchema, sessionTable, users } from '@/db/schema'
import createCookie from '@/utils/createCookie'
import getURL from '@/utils/getURL'
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { GitHub, Google } from 'arctic'
import { Lucia } from 'lucia'
import 'server-only'
import { z } from 'zod'

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
			id: attributes.id,
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

import { cookies } from 'next/headers'
import { cache } from 'react'
interface DatabaseUserAttributes {
	username: string
	id: number
}

export const getUser = cache(async () => {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
	if (!sessionId) return null
	const { user, session } = await lucia.validateSession(sessionId)
	try {
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie()
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		}
	} catch {
		// Next.js throws error when attempting to set cookies when rendering page
	}
	return user
})

export const SITE_URL = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: `http://localhost:${process.env.PORT || '3000'}`

export const arcticGithub = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, {
	redirectURI: 'api/github/callback',
})

export const arctigGoogle = new Google(
	process.env.GOOGLE_CLIENT_ID!,
	process.env.GOOGLE_SECRET!,
	getURL('api/google/callback').href
)

export const UserInfoValidator = z.discriminatedUnion('isOauth', [
	z.object({
		email: z.string().email(),
		password: z.string(),
		isOauth: z.literal(false),
	}),
	z.object({
		email: z.string().email(),
		username: z.string().optional(),
		isOauth: z.literal(true),
	}),
])

export const userInfoCookie = createCookie('userInfo', UserInfoValidator)

export type UserInfo = z.infer<typeof UserInfoValidator>

export const oauthErrorCookie = createCookie('oauthError', z.string())

export const userIdCookie = createCookie('userId', InsertUsersSchema.shape.id)

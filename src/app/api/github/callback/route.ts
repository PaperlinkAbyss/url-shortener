import { db } from '@/db/db'
import { users } from '@/db/schema'
import getURL from '@/utils/getURL'
import { OAuth2RequestError } from 'arctic'
import { eq } from 'drizzle-orm'
import { generateId } from 'lucia'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { arcticGithub } from '../../../../../adapters/arctic'
import { lucia } from '../../../../../adapters/lucia'

const GithubValidator = z.object({
	login: z.string(),
	email: z.string().email(),
	id: z.number(),
})

export async function GET(request: Request) {
	const url = new URL(request.url)
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	const storedState = cookies().get('github_oauth_state')?.value ?? null
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		})
	}
	try {
		const tokens = await arcticGithub.validateAuthorizationCode(code)
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		})
		const githubUser = await githubUserResponse.json()

		const validResponse = GithubValidator.safeParse(githubUser)
		if (!validResponse.success) return new Response(null, { status: 401 })
		const existingUser = await db.query.users.findFirst({ where: eq(users.email, validResponse.data.email) })
		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			return new Response(null, {
				status: 302,
				headers: {
					Location: getURL('/'),
				},
			})
		}

		const qrId = generateId(15)
		const userID = await db
			.insert(users)
			.values({
				email: validResponse.data.email,
				username: validResponse.data.login,
				qrId,
			})
			.returning({ userId: users.id })

		const session = await lucia.createSession(userID?.[0]?.userId, {})
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		return new Response(null, {
			status: 302,
			headers: {
				// Todo: fix this
				Location: '/',
			},
		})
	} catch (e) {
		console.log('Error', { e })
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400,
			})
		}
		return new Response(null, {
			status: 500,
		})
	}
}

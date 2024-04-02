import { db } from '@/db/db'
import { github, users } from '@/db/schema'
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
		const existingUser = await db.query.github.findFirst({ where: eq(githubUser.id, github.githubId) })
		if (existingUser) {
			const session = await lucia.createSession(existingUser?.userId, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/',
				},
			})
		}

		const qrId = generateId(15)
		const userID = await db.transaction(async () => {
			const userId = await db
				.insert(users)
				.values({
					email: validResponse.data.email,
					username: validResponse.data.login,
					qrId,
				})
				.returning({ userId: users.id })

			await db
				.insert(github)
				.values({ githubId: validResponse.data.id, githubUsername: validResponse.data.login, userId: userId[0].userId })
				.onConflictDoUpdate({ target: github.userId, set: { userId: userId[0].userId } })
			return userId[0].userId
		})

		const session = await lucia.createSession(userID, {})
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		return new Response(null, {
			status: 302,
			headers: {
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

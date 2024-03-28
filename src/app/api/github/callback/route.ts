import { db } from '@/db/db'
import { github } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { arcticGithub } from '../../../../../adapters/arctic'

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

		// Replace this with your own DB client.
		const existingUser = await db.query.github.findFirst({ where: eq(githubUser.id, github.githubId) })
		console.log('What is this all', { tokens, githubUserResponse, existingUser })
		// await db.table('user').where('github_id', '=', githubUser.id).get()
		return
		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/',
				},
			})
		}

		const userId = generateId(15)

		// Replace this with your own DB client.
		await db.table('user').insert({
			id: userId,
			github_id: githubUser.id,
			username: githubUser.login,
		})

		const session = await lucia.createSession(userId, {})
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		})
	} catch (e) {
		// the specific error message depends on the provider
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

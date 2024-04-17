import { db } from '@/db/db'
import { users } from '@/db/schema'
import { arcticGithub, lucia, oauthErrorCookie, userIdCookie, userInfoCookie } from '@/lib/auth'
import getURL from '@/utils/getURL'
import { OAuth2RequestError } from 'arctic'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { z } from 'zod'

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
		// Something went wrong, should go back to page
		oauthErrorCookie.set('Something failed, please try again.')
		userInfoCookie.delete()
		//TODO: make it so it's more friendly with the user. Know if they are coming from register or login
		return Response.redirect('/login')
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
			//User is logging.
			const session = await lucia.createSession(existingUser.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			userIdCookie.set(existingUser.id)
			return Response.redirect(getURL())
		}

		// User is not on the db, so this must be a register, need to further process things on second part.
		userInfoCookie.set({
			email: validResponse.data.email,
			username: validResponse.data.login,
			isOauth: true,
		})
		return Response.redirect(getURL('register/set-username'))
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

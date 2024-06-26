import { arcticGithub } from '@/lib/auth'
import { generateState } from 'arctic'
import { cookies } from 'next/headers'
import 'server-only'
export async function GET(request: Request) {
	const state = generateState()
	const url = await arcticGithub.createAuthorizationURL(state)

	cookies().set('github_oauth_state', state, {
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	})
	return Response.redirect(url)
}

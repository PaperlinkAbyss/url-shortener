'use server'
import { generateState } from 'arctic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import 'server-only'
import { arcticGithub } from '../../../../adapters/arctic'
export async function page(request: Request) {
	const state = generateState()
	const url = await arcticGithub.createAuthorizationURL(state)

	cookies().set('github_oauth_state', state, {
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	})
	console.log('What is user doing?', { state, url })
	// return Response.redirect(url)
	return redirect(url.toString())
}

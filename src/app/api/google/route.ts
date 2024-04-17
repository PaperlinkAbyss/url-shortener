import { arctigGoogle } from '@/lib/auth'
import { generateCodeVerifier } from 'arctic'
import { cookies } from 'next/headers'
import { generateState } from 'oslo/oauth2'

export async function GET() {
	const state = generateState()
	const codeVerifier = generateCodeVerifier()
	const url = await arctigGoogle.createAuthorizationURL(state, codeVerifier, { scopes: ['profile', 'email'] })

	cookies().set('google_oauth_state', state, {
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	})
	cookies().set('code_verifier', codeVerifier, {
		secure: true,
		path: '/',
		httpOnly: true,
		maxAge: 10 * 60,
	})

	return Response.redirect(url)
}

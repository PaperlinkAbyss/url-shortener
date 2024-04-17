import { isUserOnDB } from '@/db/queries'
import { arctigGoogle, oauthErrorCookie, userIdCookie, userInfoCookie } from '@/lib/auth'
import getURL from '@/utils/getURL'
import { cookies } from 'next/headers'
import { z } from 'zod'
const GoogleUserValidator = z.object({
	name: z.string().optional(),
	given_name: z.string().optional(),
	family_name: z.string().optional(),
	email: z.string().email().min(1),
})

export async function GET(request: Request) {
	const url = new URL(request.url)
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')

	const storedState = cookies().get('google_oauth_state')?.value
	const storedCodeVerifier = cookies().get('code_verifier')?.value

	if (!code || !storedState || !storedCodeVerifier || state !== storedState) {
		userInfoCookie.delete()
		userIdCookie.delete()
		return new Response(null, { status: 401 })
	}

	try {
		const tokens = await arctigGoogle.validateAuthorizationCode(code, storedCodeVerifier)
		const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		})
		const user = await response.json()
		const validData = GoogleUserValidator.safeParse(user)

		if (!validData.success) {
			oauthErrorCookie.set('Error on google login.', { expires: 60, maxAge: 60 })
			return Response.redirect('/', 401)
		}
		const isUserOnDb = await isUserOnDB(validData.data.email)
		if (!isUserOnDb) {
			userInfoCookie.set({ isOauth: true, email: validData.data.email, username: validData.data.name || '' })
			return Response.redirect(getURL('register/set-username'))
		}
		userIdCookie.set(isUserOnDb.id)
		return Response.redirect(getURL())
	} catch (e) {
		oauthErrorCookie.set('Error on google login.', { expires: 60, maxAge: 60 })
		userInfoCookie.delete()
		userIdCookie.delete()
		console.log('Error', { e, storedCodeVerifier, storedState, code, state })
		return Response.redirect(getURL())
	}
}

import { db } from '@/db/db'
import { users } from '@/db/schema'
import getURL from '@/utils/getURL'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { arctigGoogle } from '../../../../../adapters/arctic'
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
		// 400
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
		if (!validData.success) return Response.redirect('/', 401)
		const isUserOnDb = await db.query.users.findFirst({ where: eq(users.email, validData.data.email) })
		if (!isUserOnDb) {
			// cookies().set('userInfo', JSON.stringify({userName: }), { maxAge: 60 * 5 })
			return Response.redirect(getURL('register/caca'))
		}
		return Response.redirect(getURL())
	} catch (e) {
		cookies().set('oauthError', 'Error on google login.', { expires: 60, maxAge: 60 })
		console.log('Error', { e, storedCodeVerifier, storedState, code, state })
		return Response.redirect(getURL())
	}
}

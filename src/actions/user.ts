'use server'
import { isUserOnDB, registerUser } from '@/db/queries'
import { cookies } from 'next/headers'
import { Argon2id } from 'oslo/password'
import { z } from 'zod'
import { lucia } from '../../adapters/lucia'
const RegisterValidator = z.object({
	username: z.string().min(3).max(120),
	password: z.string().min(5).max(255),
	email: z.string().email().min(1),
})
const LoginValidator = z.object({
	usernameOrEmail: z.string().min(1),
	password: z.string().min(3),
})

export async function login(prevState: Return, formData: FormData) {
	const infoPre = Object.fromEntries(formData.entries())
	const info = LoginValidator.safeParse(infoPre)
	if (!info.success) {
		return { isLoaded: true, error: true, reason: info.error.message, success: false }
	}
	const hashpw = await new Argon2id().hash(info.data.password)
	const userFound = await isUserOnDB({
		usernameOrEmail: info.data.usernameOrEmail,
	})
	if (userFound && userFound.hashedPassword) {
		const isValidPw = await new Argon2id().verify(userFound.hashedPassword, info.data.password)
		if (isValidPw) {
			const session = await lucia.createSession(userFound.id, {})
			const sessionCookie = await lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			return { error: false, isLoaded: true, success: true } //This should be a login so gud, redirect to wherever
		}
		return { error: true, isLoaded: true, success: false, reason: 'You wrote something wrong, please try again!' }
	}
	//User is NOT on DB, so it should just tell you you are bad
	console.log('Not found', { userFound, pw: info.data.password, hashedPw: hashpw })
	return { error: true, isLoaded: true, success: false, reason: 'Something is wrong, try it again?' }
}
type Return = { error: boolean; isLoaded: boolean; success?: boolean; reason?: string }

export async function register(prevState: Return, formData: FormData) {
	// As per Lucia docs:
	const infoPre = Object.fromEntries(formData.entries())
	//Input validation:
	const info = RegisterValidator.safeParse(infoPre)
	if (!info.success) {
		//Do things on error
		return { error: true, reason: info.error.message, isLoaded: true }
	} else {
		const data = info.data
		// Hash PW:
		const hashpw = await new Argon2id().hash(info.data.password)
		// Create a new user
		const result = await registerUser({
			username: data.username,
			password: hashpw,
			email: data.email,
		})
		if (result.error) {
			return { error: false, reason: result.reason, isLoaded: true, redirect: result.redirect }
		}
		// Handle all the session things:
		const userId = result.info?.userId
		if (!userId) return { error: true, isLoaded: true, reason: 'no user found' }
		const session = await lucia.createSession(userId, { qrId: result.info?.userId })
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		return { error: false, isLoaded: true }
	}
}

const LogoutValidator = z.object({
	logout: z.string().min(1),
})
export async function logout(formData: any) {
	const zodParsedInfo = LogoutValidator.safeParse(Object.fromEntries(formData.entries()))
	if (zodParsedInfo.success) {
		const sessionCookie = lucia.createBlankSessionCookie()
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		lucia.invalidateSession(zodParsedInfo.data.logout)
	}
}

'use server'
import { isUserOnDB, registerUser } from '@/db/queries'
import { lucia, userIdCookie, userInfoCookie } from '@/lib/auth'
import getURL from '@/utils/getURL'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Argon2id } from 'oslo/password'
import { z } from 'zod'

const RegisterValidator = z.object({
	username: z.string().min(3).max(120),
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
	const userFound = await isUserOnDB(info.data.usernameOrEmail)
	if (userFound && userFound.hashedPassword) {
		const isValidPw = await new Argon2id().verify(userFound.hashedPassword, info.data.password)
		if (isValidPw) {
			const session = await lucia.createSession(userFound.id, {})
			const sessionCookie = await lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			userIdCookie.set(userFound.id)
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
		console.log('Error', { info, infoPre })
		return { error: true, reason: info.error.message, isLoaded: true }
	} else {
		const _userInfo = userInfoCookie.get()
		const data = info.data
		// Hash PW:
		if (!_userInfo.success) return { error: true, reason: _userInfo.error.message, isLoaded: true }
		const userInfo = _userInfo.data

		if (!userInfo.isOauth) {
			const hashpw = userInfo.password
			// Create a new user
			const isEmailOnDB = await isUserOnDB(userInfo.email)
			const isUsernameOnDB = await isUserOnDB(data.username)
			if (isUsernameOnDB) {
				return { error: true, reason: 'Please, use another username, this one is already taken.', isLoaded: true }
			}
			if (isEmailOnDB) {
				return { error: true, reason: 'Your email is already registered.', isLoaded: true }
			}

			const result = await registerUser({
				username: data.username,
				password: hashpw,
				email: userInfo.email,
			})

			if (result.error) {
				return { error: false, reason: result.reason, isLoaded: true }
			}
			const userId = result.info?.userId
			if (!userId) return { error: true, isLoaded: true, reason: 'no user found' }
			const session = await lucia.createSession(userId, { qrId: result.info?.userId })
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
			userInfoCookie.delete()
			userIdCookie.set(userId)
			return { error: false, isLoaded: true, redirect: '/' }
		}
		// Handle all the session things:
		const isEmailOnDB = await isUserOnDB(userInfo.email)
		const isUsernameOnDB = await isUserOnDB(data.username)
		if (isUsernameOnDB) {
			return { error: true, reason: 'Please, use another username, this one is already taken.', isLoaded: true }
		}
		if (isEmailOnDB) {
			return { error: true, reason: 'Your email is already registered.', isLoaded: true }
		}
		const result = await registerUser({
			username: data.username,
			email: userInfo.email,
		})
		const userId = result.info?.userId
		if (!userId) return { error: true, isLoaded: true, reason: 'no user found' }
		const session = await lucia.createSession(userId, { qrId: result.info?.userId })
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		userInfoCookie.delete()
		userIdCookie.set(userId)

		return { error: false, isLoaded: true, redirect: '/' }
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
		userInfoCookie.delete()
		userIdCookie.delete()
		lucia.invalidateSession(zodParsedInfo.data.logout)
	}
}

const RegisterWithPasswordValidator = z.object({
	password: z.string().min(3),
	email: z.string().email().min(1),
})

export async function registerWithPassword(prevState: any, formData: FormData) {
	const info = RegisterWithPasswordValidator.safeParse(Object.fromEntries(formData.entries()))
	if (info.success) {
		const data = info.data
		const alreadyExistingEmail = await isUserOnDB(data.email)
		if (!alreadyExistingEmail) {
			const hashedPw = await new Argon2id().hash(data.password)
			userInfoCookie.set({ email: data.email, password: hashedPw, isOauth: false })
			return redirect(getURL('register/set-username').href)
		}
		return { error: true, isLoaded: true, response: 'Email already registered. Try logging.' }
	} else {
		return { error: true, isLoaded: true, reason: 'Something failed' }
	}
}

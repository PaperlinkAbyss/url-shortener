import { userIdCookie } from '@/lib/auth'
import getId from '@/utils/getID'
import { eq, or } from 'drizzle-orm'
import 'server-only'
import { z } from 'zod'
import { db } from './db'
import { urls, users } from './schema'
type Props = {
	type: 'default' | 'custom'
	unshortened: string
	text?: string
}
const ShortenedURLValidator = z.object({
	type: z.enum(['default', 'custom']),
	unshortened: z.string().url({ message: 'Please provide a valid url.' }),
	text: z.string().optional(),
})

export async function createShortenedURL({
	type,
	unshortened,
	text,
}: Props): Promise<{ success: false; reason: string } | { success: true; shortened: string; unshortened: string }> {
	// This needs to check user probably
	const userId = userIdCookie.get()
	if (!userId.success || !userId.data) return { success: false, reason: 'Not logged. ' }
	const isOnDB = await getLongURLInfo(unshortened, userId.data)
	// Check if url already exists (shortened)
	let shortened = text ?? getId()
	let isShortURLOnDb = await getShortURLInfo(shortened)
	console.log('Short url on DB?', { isShortURLOnDb, shortened, isOnDB, type })
	if (isShortURLOnDb) {
		while (isShortURLOnDb) {
			shortened = getId()
			isShortURLOnDb = await getShortURLInfo(shortened)
		}
	}
	if (isOnDB) {
		return { success: false, reason: 'Url is already on db' }
	}
	if (type === 'custom') {
		if (!text || text === '/') {
			console.log('Provide a valid url', { type, text })
			return { success: false, reason: 'Provide a valid url' }
		}
		if (!userId.data) return { success: false, reason: 'Invalid user. Please login again' }
		await db.insert(urls).values({ unshortened, shortened, type, userId: userId.data })
		return { shortened, unshortened, success: true }
	}
	if (!userId.data) return { success: false, reason: 'Invalid user. Please login again.' }
	await db.insert(urls).values({ unshortened, shortened, type, userId: userId.data })
	return { shortened, unshortened, success: true }
}

export async function getShortURLInfo(shortURL: string) {
	return db.query.urls.findFirst({ where: eq(urls.shortened, shortURL) })
}

async function getLongURLInfo(unshortened: string, userId: number | undefined) {
	return db.query.urls.findFirst({
		where: (url, { and, eq }) => and(eq(url.unshortened, unshortened), eq(url.userId, userId || 0)),
	})
}

export async function isUserOnDB(usernameOrEmail: string) {
	return db.query.users.findFirst({
		where: or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)),
	})
}

export async function isUsernameOrEmailOnDB({ username, email }: { username: string; email: string }) {
	return db.query.users.findFirst({ where: or(eq(users.username, username), eq(users.email, email)) })
}

export async function registerUser({
	username,
	email,
	password,
}: {
	username: string
	password?: string
	email: string
}) {
	console.log('cosas', { username, password, email })
	if (password) {
		const info = await db
			.insert(users)
			.values({ username, email, hashedPassword: password })
			.returning({ userId: users.id })
			.onConflictDoNothing()
		console.log('preinfo')
		if (!info) {
			return { error: true, reason: 'Failed to insert on db' }
		}
		console.log('info', info[0])
		return { error: false, info: info[0] }
	}
	const info = await db.insert(users).values({ username, email }).returning({ userId: users.id }).onConflictDoNothing()
	if (!info) {
		return { error: true, reason: 'Failed to insert on db' }
	}
	return { error: false, info: info[0] }
}

export async function updateUsername(username: string) {
	const id = userIdCookie.get()
	if (!id.success || !id.data) return { error: true, reason: 'Id not found' }
	if (await isUserOnDB(username)) {
		return { error: true, reason: 'User is already on use.' }
	}
	return db.update(users).set({ username }).where(eq(users.id, id.data)).returning({ username: users.username })
}

export async function isUsernameOnDb(username: string) {
	return Boolean(await db.query.users.findFirst({ where: eq(users.username, username) }))
}

export async function addVisit(id: number, visits: number) {
	console.log('Updating:', { id, visits })
	return db
		.update(urls)
		.set({ visits: visits + 1 })
		.where(eq(urls.id, id))
}

export async function getUsernameAndURLS(userId: number) {
	const username = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { username: true } })
	const userUrls = await db.query.urls.findMany({
		where: eq(urls.userId, userId),
		columns: { shortened: true, id: true },
	})
	return { username: username?.username, userUrls }
}

'use server'
import getId from '@/utils/getID'
import { and, eq, or } from 'drizzle-orm'
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
	const isOnDB = await getLongURLInfo(unshortened)
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
		return { success: true, shortened: isOnDB.shortened, unshortened: isOnDB.unshortened }
	}
	if (type === 'custom') {
		if (!text || text === '/') {
			console.log('Provide a valid url', { type, text })
			return { success: false, reason: 'Provide a valid url' }
		}
		await db.insert(urls).values({ unshortened, shortened, type })
		return { shortened, unshortened, success: true }
	}
	await db.insert(urls).values({ unshortened, shortened, type })
	return { shortened, unshortened, success: true }
}

export async function getShortURLInfo(shortURL: string) {
	return (await db.select().from(urls).where(eq(urls.shortened, shortURL))).at(0)
}

async function getLongURLInfo(unshortened: string) {
	return (await db.select().from(urls).where(eq(urls.unshortened, unshortened))).at(0)
}
export async function deleteNote(id: number) {
	await db.delete(urls).where(eq(urls.id, id))
}
export async function isUserOnDB({ usernameOrEmail }: { usernameOrEmail: string }) {
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
	displayName,
}: {
	username: string
	password: string
	email: string
	displayName?: string
}) {
	const userInfo = await isUsernameOrEmailOnDB({ username, email })
	if (!userInfo) {
		return { error: true, reason: 'Already existing user! redirecting to login', redirect: '/login' }
	}
	if (!userInfo.hashedPassword) {
		const providersInfo = await db.query.users.findFirst({
			where: or(eq(users.username, username), eq(users.email, email)),
			with: { github: true },
		})
		return { error: true }
	}
	const qrId = getId(25)
	const info = await db
		.insert(users)
		.values({ username, email, hashedPassword: password, qrId, displayName: displayName ?? '' })
		.returning({ userId: users.id, qrId: users.qrId })
		.onConflictDoNothing()
	if (!info) {
		return { error: true, reason: 'Failed to insert on db' }
	}
	return { error: false, info: info[0] }
}

export async function updateUserDisplayName({
	username,
	password,
	newName,
}: {
	username: string
	password: string
	newName: string
}) {
	return db
		.update(users)
		.set({ displayName: newName })
		.where(and(eq(users.username, username), eq(users.hashedPassword, password)))
		.returning({ displayName: users.displayName })
}

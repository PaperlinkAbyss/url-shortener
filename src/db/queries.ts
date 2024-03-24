'use server'
import getId from '@/utils/getID'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from './db'
import { urls } from './schema'
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
			console.log('Provide a valid url dumbdumb', { type, text })
			return { success: false, reason: 'Provide a valid url dumbdumb' }
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

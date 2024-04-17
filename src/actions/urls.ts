'use server'

import { db } from '@/db/db'
import { createShortenedURL } from '@/db/queries'
import { URLSchema, urls } from '@/db/schema'
import { getUser, userIdCookie } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
type Thing = {
	isSent: boolean
	hasError: boolean
	reason: string
	shortURL: string
}

type URLData = {
	type: URLSchema['type']
	url: string
	customURL: string
}
const URLDataValidator = z.object({
	url: z.string().url(),
	type: z.enum(['default', 'custom']),
	customURL: z.string(),
})
export async function sendURL(prevState: Thing, data: FormData) {
	const info = Object.fromEntries(data.entries())
	console.log('url validator', URLDataValidator)
	const userId = userIdCookie.get()
	if (!userId.success) return { hasError: true, reason: 'Not logged', isSent: true, shortURL: '' }
	const _parsed = URLDataValidator.safeParse(info)
	// console.log('Parsed', { parsed })
	if (!_parsed.success) {
		return { isSent: true, hasError: true, reason: JSON.stringify(_parsed.error.message), shortURL: '' }
	}
	const parsed = _parsed.data
	if (parsed.type === 'custom') {
		const shortenedInfo = await createShortenedURL({
			type: parsed.type,
			unshortened: parsed?.url,
			text: parsed.customURL
				.replace('.', '-') // replace a dot by a dash
				.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
				.replace(/\s+/g, '-') // collapse whitespace and replace by a dash
				.replace(/-+/g, '-') // collapse dashes
				.replace(/\//g, ''), // collapse all forward-slashes
		})
		if (!shortenedInfo.success) {
			return { isSent: true, hasError: true, reason: shortenedInfo.reason, shortURL: '' }
		}
		return { isSent: true, hasError: false, reason: '', shortURL: shortenedInfo.shortened }
	}
	const shortenedInfo = await createShortenedURL({ type: parsed.type, unshortened: parsed.url })
	if (!shortenedInfo.success) {
		return { isSent: true, hasError: true, reason: shortenedInfo.reason, shortURL: '' }
	}
	return { isSent: true, hasError: false, reason: '', shortURL: shortenedInfo.shortened }
}

const noteInfoValidator = z.object({ urlId: z.string().transform((el) => Number(el)) })

export async function deleteUrl(formData: FormData) {
	const user = await getUser()
	const info = Object.fromEntries(formData.entries())
	const urlId = noteInfoValidator.safeParse(info)
	if (!urlId.success || !user) return redirect('/')
	await db.delete(urls).where(eq(urls.id, urlId.data.urlId))
	return revalidatePath('/profile')
}

export async function deleteAllUrls() {
	const user = await getUser()
	if (!user) return redirect('/')
	await db.delete(urls).where(eq(urls.userId, user.id))
	return revalidatePath('/profile')
}

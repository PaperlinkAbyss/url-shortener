'use server'

import { createShortenedURL } from '@/db/queries'
import { InsertURL } from '@/db/schema'
import { z } from 'zod'
type Thing = {
	isSent: boolean
	hasError: boolean
	reason: string
	shortURL: string
}

type URLData = {
	type: InsertURL['type']
	url: string
	customURL: string
	// custom
}
const URLDataValidator = z.object({
	url: z.string().url(),
	type: z.enum(['default', 'custom']),
	customURL: z.string(),
})
export async function sendURL(prevState: Thing, data: FormData) {
	const info = Object.fromEntries(data.entries()) as URLData
	console.log('Data', info)
	console.log('url validator', URLDataValidator)
	const _parsed = URLDataValidator.safeParse(info)
	// console.log('Parsed', { parsed })
	if (!_parsed.success) {
		return { isSent: true, hasError: true, reason: JSON.stringify(parsed.error.message), shortURL: '' }
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

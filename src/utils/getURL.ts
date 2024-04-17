import { SITE_URL } from '@/lib/auth'

export default function getURL(path: string = '') {
	return new URL(path, SITE_URL)
}

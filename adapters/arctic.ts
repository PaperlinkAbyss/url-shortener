import getURL from '@/utils/getURL'
import { GitHub, Google } from 'arctic'

export const SITE_URL = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: `http://localhost:${process.env.PORT || '3000'}`

export const arcticGithub = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, {
	redirectURI: getURL('api/github/callback'),
})

export const arctigGoogle = new Google(
	process.env.GOOGLE_CLIENT_ID!,
	process.env.GOOGLE_SECRET!,
	getURL('/api/google/callback')
)

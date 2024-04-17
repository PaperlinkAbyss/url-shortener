import { lucia, userIdCookie, userInfoCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
	userInfoCookie.delete()
	userIdCookie.delete()
	lucia.invalidateUserSessions(1)
	return redirect('/')
}

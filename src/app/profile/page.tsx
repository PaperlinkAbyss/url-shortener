'use server'
import { getUsernameAndURLS } from '@/db/queries'
import { userIdCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Profile from './components/Profile'

export default async function Page() {
	const userId = userIdCookie.get()
	if (!userId.success || !userId.data) redirect('/')
	const userData = await getUsernameAndURLS(userId.data)
	if (!userData?.username) redirect('/')
	return (
		<div>
			<Profile username={userData.username} urls={userData.userUrls} userId={userId.data} />
		</div>
	)
}

import SetUsername from '@/components/SetUsername'
import { userInfoCookie } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type OauthUserCookie = {
	username: string
	needsPassword: boolean
}

export default async function Page() {
	console.log('cokiez', cookies().get('userInfo'))
	const userInfo = userInfoCookie.get()
	if (!userInfo.success) redirect('/')
	return (
		<div>
			<SetUsername userInfo={userInfo.data} />
		</div>
	)
}

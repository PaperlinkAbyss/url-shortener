import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
	const userInfo = cookies().get('userInfo')
	if (!userInfo) redirect('/')
	// console.log('User info!!!',userInfo)
	return <pre>{JSON.stringify(userInfo, null, 2)}</pre>
}

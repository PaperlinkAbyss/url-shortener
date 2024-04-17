import { getUser } from '@/lib/auth'
import AuthButtons from './AuthButtons'

export default async function AuthLayout() {
	const user = await getUser()
	return <AuthButtons isUserLogged={user !== null} id={user?.id || 0} />
}

import { logout } from '@/actions/user'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AuthButtons() {
	const userCookie = cookies().get('auth_session')
	// const info = await lucia.validateSession(userCookie?.value)
	// console.log('ainfo', info)

	return (
		<span className='flex content-end text-end p-2 justify-end mr-4 '>
			{userCookie?.value ? (
				<form action={logout}>
					<button
						name='logout'
						className='border border-gray-600/20 p-2 rounded-lg transition-colors hover:bg-gray-300/20 ease-in'
						value={userCookie.value}>
						Logout
					</button>
				</form>
			) : (
				<>
					<Link
						href='/login'
						className='border border-gray-600/20 p-2 rounded-lg transition-colors hover:bg-gray-300/20 ease-in'>
						Login
					</Link>
					<div className=' p-2'>/</div>
					<Link
						href='/register'
						className='p-2 border-gray-600/20 border rounded-lg transition-colors hover:bg-gray-300/20 ease-in'>
						Register
					</Link>
				</>
			)}
		</span>
	)
}

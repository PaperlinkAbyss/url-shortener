'use client'
import { logout } from '@/actions/user'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { ReactNode } from 'react'
type Props = {
	isUserLogged: boolean
	id: number
}

export default function AuthButtons({ isUserLogged, id }: Props) {
	const segment = useSelectedLayoutSegment()
	switch (true) {
		case !isUserLogged && !segment: {
			return (
				<Wrapper>
					<LinkToLogin />
					<Separator />
					<LinkToRegister />
				</Wrapper>
			)
		}
		case !isUserLogged && segment === 'login': {
			return (
				<Wrapper>
					<LinkToHome />
					<Separator />
					<LinkToRegister />
				</Wrapper>
			)
		}
		case !isUserLogged && segment === 'register': {
			return (
				<Wrapper>
					<LinkToHome />
					<Separator />
					<LinkToLogin />
				</Wrapper>
			)
		}
		case isUserLogged && Boolean(id) && segment === 'profile': {
			return (
				<Wrapper>
					<LinkToHome />
					<Separator />
					<LogoutButton id={id} />
				</Wrapper>
			)
		}
		case isUserLogged && Boolean(id): {
			return (
				<Wrapper>
					<LinkToProfile />
					<Separator />
					<LogoutButton id={id} />
				</Wrapper>
			)
		}
		case !isUserLogged: {
		}
		default:
			return null
	}
}

function Wrapper({ children, ...props }: { children: ReactNode; props?: Record<string, any> }) {
	return (
		<span className='flex content-end text-end p-2 justify-end mr-4' {...props}>
			{children}
		</span>
	)
}

function LinkToLogin() {
	return (
		<>
			<Link
				href='/login'
				className='border relative border-gray-600/20 p-1 rounded-lg transition-colors hover:bg-gray-300/20 ease-in inline-block'>
				<span className='invisible'>Register</span>
				<span className='absolute inset-0 grid place-items-center text-center'>Login</span>
			</Link>
		</>
	)
}

function LinkToHome() {
	return (
		<Link
			href='/'
			className='border relative border-gray-600/20 p-1 rounded-lg transition-colors hover:bg-gray-300/20 ease-in inline-block'>
			<span className='invisible'>Register</span>
			<span className='absolute inset-0 grid place-items-center text-center'>Home</span>
		</Link>
	)
}

function LinkToProfile() {
	return (
		<Link
			href='profile'
			className='border relative border-gray-600/20 p-1 rounded-lg transition-colors hover:bg-gray-300/20 ease-in inline-block'>
			<span className='invisible'>Register</span>
			<span className='absolute inset-0 grid place-items-center text-center'>Profile</span>
		</Link>
	)
}

function LinkToRegister() {
	return (
		<Link
			href='/register'
			className='border relative border-gray-600/20 p-1 rounded-lg transition-colors hover:bg-gray-300/20 ease-in inline-block'>
			<span className='invisible'>Register</span>
			<span className='absolute inset-0 grid place-items-center text-center'>Register</span>
		</Link>
	)
}
function Separator() {
	return <div className=' mx-1.5 p-1'>&#47;</div>
}

function LogoutButton({ id }: { id: number }) {
	return (
		<form action={logout}>
			<button
				name='logout'
				className='border relative border-gray-600/20 p-1 rounded-lg transition-colors hover:bg-gray-300/20 ease-in inline-block'
				value={id}>
				<span className='invisible'>Register</span>
				<span className='absolute inset-0 grid place-items-center text-center'>Logout</span>
			</button>
		</form>
	)
}

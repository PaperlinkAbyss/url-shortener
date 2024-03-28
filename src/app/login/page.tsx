'use client'
import { login } from '@/actions/user'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useFormState } from 'react-dom'
const inputStyles = 'pl-2 border border-gray-600/20 rounded-lg py-1'
const labelStyles = 'font-semibold pb-1 text-md pt-2 mt-2'
const baseButton = 'px-1 py-2 rounded-md my-2 border border-gray-600/20  transition-colors ease-in '
export default function Page() {
	const [isLoaded, action] = useFormState(login, { error: false, isLoaded: false, success: false })
	const router = useRouter()
	useEffect(() => {
		let timeout: NodeJS.Timeout
		console.log('Effect?', { isLoaded, condition: !isLoaded.error && isLoaded.isLoaded })

		if (!isLoaded.error && isLoaded.isLoaded) {
			timeout = setTimeout(() => {
				router.push('/')
			}, 2_000)
		}
		return () => clearTimeout(timeout)
	}, [isLoaded.isLoaded])

	return (
		<div className='grid place-content-center  w-screen h-screen'>
			<div className='border border-gray-600/20 rounded-md flex flex-col w-[30vw] '>
				<form action={action} className='flex flex-col p-4'>
					<h2 className='text-3xl font-semibold text-center pb-4'>Login</h2>
					<label htmlFor='usernameOrEmail' className={labelStyles}>
						Username or email
					</label>
					<input
						type='text'
						name='usernameOrEmail'
						className={inputStyles}
						id='usernameOrEmail'
						defaultValue='chon'
						required
					/>
					<label htmlFor='password' className={labelStyles}>
						Password
					</label>
					<input
						type='password'
						autoComplete='current-password'
						defaultValue='contraseña1'
						name='password'
						id='password'
						className={inputStyles}
						required
						min={5}
					/>
					<button type='submit' className={clsx(baseButton, 'bg-black text-white my-4 hover:bg-black/80 ')}>
						Sign up
					</button>
					{isLoaded && isLoaded.success ? 'Propely logged, thank you!' : isLoaded.reason}
				</form>
				<div className='border-t-2 border-gray-600/20 grid p-4 '>
					<Link href='/api/github' className={clsx(baseButton, 'bg-white hover:bg-gray-400/10')}>
						Log in with [oauth to be determined]
					</Link>
					<button className={clsx(baseButton, 'bg-white hover:bg-gray-400/10')}>
						Log in with [oauth to be determined]
					</button>
				</div>
			</div>
		</div>
	)
}

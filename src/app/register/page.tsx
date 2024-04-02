'use client'
import { register } from '@/actions/user'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { page } from '../api/github/action'
const inputStyles = 'pl-2 border border-gray-600/20 rounded-lg py-1'
const labelStyles = 'font-semibold pb-1 text-md pt-2 mt-2'
const baseButton = 'px-1 py-2 rounded-md my-2 border border-gray-600/10  transition-colors ease-in '
export default function Page() {
	const [isLoaded, action] = useFormState(register, { error: false, isLoaded: false })
	const router = useRouter()
	useEffect(() => {
		let timeout: NodeJS.Timeout
		console.log('Effect?', { isLoaded, condition: !isLoaded.error && isLoaded.isLoaded })

		if (!isLoaded.error && isLoaded.isLoaded) {
			timeout = setTimeout(() => {
				router.push('/')
			}, 2_000)
		}
		if (isLoaded.error && isLoaded.redirect) {
			timeout = setTimeout(() => {
				router.push(isLoaded.redirect ?? '/register')
			}, 2_000)
		}
		return () => clearTimeout(timeout)
	}, [isLoaded.isLoaded, isLoaded.redirect])
	return (
		<div className='grid place-content-center  w-screen h-screen'>
			<div className='border border-gray-600/20 rounded-md flex flex-col w-[30vw] '>
				<form action={action} className='flex flex-col p-4'>
					<h2 className='text-3xl font-semibold text-center pb-4'>Register</h2>
					<input type='text' name='username' className={inputStyles} id='username' defaultValue='chon' required />
					<label htmlFor='email' className={labelStyles}>
						Email
					</label>
					<input
						type='email'
						name='email'
						id='email'
						className={inputStyles}
						defaultValue='z5512345z@gmail.com'
						required
					/>
					<input type='text' name='displayName' className={inputStyles} placeholder='(optional)' />
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
					<button type='submit' className={clsx(baseButton, 'bg-black text-white my-4 hover:bg-black/20 ')}>
						Sign up
					</button>
					{isLoaded && !isLoaded.error ? 'Properly registered, thank you!' : isLoaded.reason}
				</form>
				<div className='border-t-2 border-gray-600/20 grid p-4 '>
					<form action={page}>
						<button className={clsx(baseButton, 'bg-white')}>Sign up with Github</button>
					</form>
					<Link href='/api/google' className={clsx(baseButton, 'bg-white')}>
						Sign up with Google
					</Link>
				</div>
			</div>
		</div>
	)
}

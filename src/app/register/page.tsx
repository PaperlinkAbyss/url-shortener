'use client'
import { registerWithPassword } from '@/actions/user'
import { baseButton, inputStyles, labelStyles } from '@/utils/constants'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'

export default function Page() {
	const [isLoaded, action] = useFormState(registerWithPassword, { error: false, isLoaded: false, response: '' })
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
	}, [isLoaded, isLoaded.isLoaded, router])
	return (
		<div className='grid place-content-center  w-screen h-screen'>
			<div className='border border-gray-600/20 rounded-md flex flex-col w-[30vw] '>
				<form action={action} className='flex flex-col p-4'>
					<h2 className='text-3xl font-semibold text-center pb-4'>Register</h2>
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
					<Link href='/api/github' className={clsx(baseButton, 'bg-white')}>
						Sign up with Github
					</Link>
					<Link href='/api/google' className={clsx(baseButton, 'bg-white')}>
						Sign up with Google
					</Link>
				</div>
			</div>
		</div>
	)
}

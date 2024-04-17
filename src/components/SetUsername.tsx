'use client'

import { register } from '@/actions/user'
import { UserInfo } from '@/lib/auth'
import { baseButton, inputStyles, labelStyles } from '@/utils/constants'
import clsx from 'clsx'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'

type Props = {
	userInfo: UserInfo
}
export default function SetUsername({ userInfo }: Props) {
	const [state, action] = useFormState(register, {
		error: false,
		isLoaded: false,
		reason: '',
	})
	useEffect(() => {
		let timeout: NodeJS.Timeout
		if (state.isLoaded && !state.error) {
			timeout = setTimeout(() => redirect('/'), 2_000)
		}
		return () => {
			clearTimeout(timeout)
		}
	}, [state.error, state.isLoaded])
	return (
		<div className='grid place-content-center  w-screen h-screen'>
			<div className='border border-gray-600/20 rounded-md flex flex-col w-[30vw] '>
				<form action={action} className='flex flex-col p-4'>
					<h2 className='text-3xl font-semibold text-center pb-4 mb-5'>Select username</h2>
					{state.isLoaded && state.error && <label className={clsx(labelStyles)}>{state.reason}</label>}
					<input name='username' className={inputStyles} defaultValue={userInfo.isOauth ? userInfo?.username : ''} />
					<button className={clsx(baseButton, 'bg-black text-white')}>Register</button>
					{state.isLoaded && !state.error && <label className={labelStyles}>{state.reason}</label>}
				</form>
			</div>
		</div>
	)
}

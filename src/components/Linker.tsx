'use client'
import { sendURL } from '@/actions/urls'
import clsx from 'clsx'
import { MouseEvent, useReducer, useState } from 'react'
import { useFormState } from 'react-dom'
export default function Linker() {
	const [selected, setSelected] = useState<'default' | 'custom'>('default')
	const [isOpen, toggle] = useReducer((a) => !a, false)
	function copyToClipboard(event: MouseEvent<HTMLInputElement>) {
		if (event.detail >= 2) {
			navigator.clipboard.writeText(location.href + state.shortURL)
		}
	}
	const [state, formAction] = useFormState(sendURL, { shortURL: '', hasError: false, isSent: false, reason: '' })

	function openNonLoggedModal() {}
	return (
		<form className='grid place-content-center justify-center h-screen' action={formAction}>
			<h2 className='text-8xl font-bold mb-10'>
				Sh<span className='underline'>URL</span>ter
				<span className='text-xs text-center mt-2 block font-light text-black/40'>
					read as <span className='italic'>sho-&apos;er</span>, famous british slang for{' '}
					<span className='italic'>shorter</span>
				</span>
			</h2>
			{state?.isSent && state.hasError && <div className='text-center'>putito ha fallao:{state?.reason}</div>}
			<div className='grid grid-cols-1 gap-1 '>
				<label htmlFor='short-url-input' className='text-center mb-1'>
					Insert URL
				</label>
				<input
					placeholder='https://example.com'
					id='short-url-input'
					className='border border-black/20 p-1 rounded-md ml-2 pl-1.5 '
					type='url'
					name='url'
					required
				/>
				<div className=' grid place-content-center'>
					<div className='text-center flex'>
						<input
							type='radio'
							value='default'
							name='type'
							onClick={() => setSelected('default')}
							checked={selected === 'default'}
							onChange={() => {}}
							className='border border-red bg-black self-center mr-1 ml-2 h-full'
						/>
						<label className='text-center justify-center justify-self-center' onClick={() => setSelected('default')}>
							random url
						</label>
						<input
							type='radio'
							value='custom'
							checked={selected === 'custom'}
							onClick={() => setSelected('custom')}
							onChange={() => {}}
							name='type'
							className='border border-black bg-black self-center ml-2 mr-1 h-full justify-self-center'
						/>
						<label className='text-end' onClick={() => setSelected('custom')}>
							custom url
						</label>
					</div>
				</div>
				<input
					type='text'
					defaultValue='/'
					name='customURL'
					required={selected === 'custom'}
					className={clsx(
						'border-black block rounded-md pl-1.5 w-full ml-2 mr-1 border align-center mx-auto justify-center',
						selected === 'custom' ? 'visible' : 'invisible'
					)}
				/>
			</div>
			<button
				type='submit'
				onClick={openNonLoggedModal}
				className='bg-black text-white font-medium mt-1 p-1 rounded-lg '>
				Shorten URL
			</button>
			<input
				onClick={copyToClipboard}
				value={state.shortURL ? `${location.href}${state.shortURL}` : ''}
				className='text-center mt-4'
			/>
		</form>
	)
}

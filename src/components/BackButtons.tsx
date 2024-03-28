import Link from 'next/link'
type Props = { backTo: string }
export default function BackButtons({ backTo }: Props) {
	return (
		<span className='flex content-end text-end p-2 justify-end mr-4 '>
			<Link
				href='/'
				className='border border-gray-600/20 p-2 rounded-lg transition-colors hover:bg-gray-300/20 ease-in'>
				Home
			</Link>
			<div className=' p-2'>/</div>
			<Link
				href={`/${backTo.toLowerCase()}`}
				className='p-2 border-gray-600/20 border rounded-lg transition-colors hover:bg-gray-300/20 ease-in'>
				{backTo}
			</Link>
		</span>
	)
}

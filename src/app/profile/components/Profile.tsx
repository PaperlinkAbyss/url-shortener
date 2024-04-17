import { deleteAllUrls, deleteUrl } from '@/actions/urls'
import { getUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type Props = {
	username: string
	urls: { shortened: string; id: number }[]
	userId: number
}

export default async function Profile({ username, urls, userId }: Props) {
	const user = getUser()
	if (!user) redirect('/login')
	return (
		<div>
			<h2 className='text-3xl text-center mt-10'>
				Henlo <span className='underline'>{username}</span> :3 here are your links
			</h2>
			<div className='grid content-center text-center   '>
				<div className='mx-auto grid grid-cols-1 gap-2 mt-2'>
					<table className='border border-black'>
						<thead>
							<tr>
								<td className='p-2'>URL</td>
								<td className='p-2'>Visits</td>
								<td className='p-2'>
									<form action={deleteAllUrls}>
										<button className='px-1 py-1 rounded-md my-2 border border-gray-600/10  transition-colors ease-in hover:bg-black/20'>
											Delete all
										</button>
									</form>
								</td>
							</tr>
						</thead>
						{urls.map((el, i) => {
							return (
								<tr key={el.id} className=''>
									<td className='p-2'>
										<Link
											href={el.shortened}
											className='px-1 py-1 text-center justify-center align-middle flex items-center hover:underline'>
											/{el.shortened}
										</Link>
									</td>
									<td className='p-2'>0</td>
									<td className='p-2'>
										<form action={deleteUrl} className='block cursor:pointer ml-2'>
											<input type='hidden' value={el.id} name='urlId' />
											<button className='px-1 py-1 rounded-md my-2 border border-gray-600/10  transition-colors ease-in hover:bg-black/20'>
												Delete
											</button>
										</form>
									</td>
								</tr>
							)
						})}
					</table>
				</div>
			</div>
		</div>
	)
}

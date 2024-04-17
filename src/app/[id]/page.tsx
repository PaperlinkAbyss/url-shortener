import { addVisit, getShortURLInfo } from '@/db/queries'
import { notFound, redirect } from 'next/navigation'

type Props = {
	params: { id: string }
}
export const dynamic = 'force-dynamic'

export default async function Page({ params }: Props) {
	const id = params.id
	if (typeof params.id !== 'string') notFound()
	const info = await getShortURLInfo(params.id)
	if (!info) notFound()
	await addVisit(info.id, info.visits)
	return redirect(info?.unshortened)
}

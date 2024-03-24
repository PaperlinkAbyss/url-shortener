
import { deleteNote } from '@/db/queries'
import { redirect } from 'next/navigation'
import { getShortURLInfo } from '@/db/queries'
type Props = {
	params: { id: string }
}
export default async function Page({ params }: Props) {
	const noteInfo = await getShortURLInfo(params.id)
	console.log('Note info', noteInfo)
	if (noteInfo?.deletionDate && new Date(noteInfo.deletionDate).getDate() < new Date().getDate()) {
		deleteNote(noteInfo.id)
		return redirect('/') // redirect and delete note?
	}
	if (!noteInfo) redirect('/')

	return (
		<div>
			Hola id: {params.id}, nota de: {noteInfo.creationDate}
		</div>
	)
}

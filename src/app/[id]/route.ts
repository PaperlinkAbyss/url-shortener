import { getShortURLInfo } from '@/db/queries'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import 'server-only'
type Props = {
	params: { id: string }
}

export async function GET(request: NextRequest, { params }: Props) {
	const info = await getShortURLInfo(params.id)
	console.log(params, info)

	if (!info) return new Response(null, { status: 404 })
	return redirect(info?.unshortened)
}

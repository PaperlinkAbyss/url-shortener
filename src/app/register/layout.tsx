import BackButtons from '@/components/BackButtons'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div>
			<BackButtons backTo='Login' />
			{children}
		</div>
	)
}

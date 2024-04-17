import AuthLayout from '@/components/AuthLayout'
import { ReactNode } from 'react'

export default function Template({ children }: { children: ReactNode }) {
	return (
		<div>
			<AuthLayout />
			{children}
		</div>
	)
}

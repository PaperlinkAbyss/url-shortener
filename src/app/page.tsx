import AuthButtons from '@/components/AuthButtons'
import Linker from '../components/Linker'

export default function Home() {
	// const cookiesValues = cookies().get('auth_session')
	// const isValidSession = lucia.validateSession(cookiesValues.value)
	// console.log('Is valid?', isValidSession)
	return (
		<div>
			{/* {JSON.stringify(cookiesValues, null, 2)} */}
			<AuthButtons />
			<Linker />
		</div>
	)
}

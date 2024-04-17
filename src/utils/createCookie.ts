import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import 'server-only'
import type { SafeParseReturnType, TypeOf, ZodTypeAny } from 'zod'

export default function createCookie<const T extends ZodTypeAny, const N extends string>(name: N, schema: T) {
	return {
		get() {
			console.log('cookies', cookies().get(name))
			const value = cookies().get(name)?.value
			const val = value ? JSON.parse(value) : ''
			return schema.safeParse(val) as SafeParseReturnType<T, TypeOf<T>>
		},
		set(value: TypeOf<T>, options?: Partial<ResponseCookie>) {
			cookies().set(name, JSON.stringify(value), options)
		},
		delete() {
			cookies().delete(name)
		},
	}
}

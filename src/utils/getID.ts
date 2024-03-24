import { customAlphabet } from 'nanoid'

export const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')

export default function getId(length = 8) {
	return nanoid(length)
}

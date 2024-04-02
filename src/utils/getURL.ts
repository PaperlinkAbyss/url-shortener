import { SITE_URL } from '../../adapters/arctic'

export default function getURL(path: string = '') {
	return `${SITE_URL}/${path}`
}

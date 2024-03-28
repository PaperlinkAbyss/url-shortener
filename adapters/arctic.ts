import { GitHub } from 'arctic'

export const arcticGithub = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!)

import { createRouter } from '@/lib/create-app'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import pj from '../../package.json'
const router = createRouter().openapi(
	createRoute({
		method: 'get',
		path: '/',
		tags: ['Root'],
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				z.object({
					message: z.string().describe(`A welcome message for the ${pj.name} API`),
				}),
				`${pj} API ${pj.version}`
			),
		},
	}),
	(c) => {
		return c.json({ message: `Welcome to ${pj.name} API!` })
	}
)

export default router

import { createRouter } from '@/lib/create-app'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'

const router = createRouter().openapi(
	createRoute({
		method: 'get',
		path: '/',
		tags: ['Root'],
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				z.object({
					message: z.string().describe('A welcome message for the lrnr API'),
				}),
				'lrnr API'
			),
		},
	}),
	(c) => {
		return c.json({ message: 'lrnr API' })
	}
)

export default router

import { createRouter } from '@/lib/create-app'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { createApiResponse } from '@/lib/api-response'
import pj from '../../package.json'
import env from '@/env'

const router = createRouter().openapi(
	createRoute({
		method: 'get',
		path: '/',
		tags: ['Root'],
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				createApiResponse(
					z.object({
						version: z.string(),
						environment: z.string(),
					})
				),
				'lrnr API Welcome Response'
			),
		},
	}),
	(c) => {
		return c.json({
			success: true as const,
			message: `Welcome to ${pj.name} API`,
			data: {
				version: pj.version,
				environment: env.NODE_ENV,
			},
		})
	}
)

export default router

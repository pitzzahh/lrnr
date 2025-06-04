import { createRouter } from '@/lib/create-app'
import { createRoute } from '@hono/zod-openapi'

const router = createRouter().openapi(
	createRoute({
		method: 'get',
		path: '/llms',
		tags: ['Documentation'],
		summary: 'Get API documentation in markdown format',
		description: 'Returns the API documentation in markdown format suitable for LLMs',
		responses: {
			302: {
				description: 'Redirect to the main llms.txt endpoint',
			},
		},
	}),
	async (c) => {
		return c.redirect('/llms.txt')
	}
)

export default router

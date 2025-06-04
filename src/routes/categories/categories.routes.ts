import { SELECT_CATEGORIES_SCHEMA } from '@/db/schema/categories'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
const tags = ['Categories']

export const list = createRoute({
	path: '/categories',
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SELECT_CATEGORIES_SCHEMA), 'The list of categories'),
	},
})

export type ListRoute = typeof list

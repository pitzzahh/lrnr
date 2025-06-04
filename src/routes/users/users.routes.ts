import { SELECT_USERS_SCHEMA } from '@/db/schema/users'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
const tags = ['Users']

export const list = createRoute({
	path: '/users',
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SELECT_USERS_SCHEMA), 'The list of users'),
	},
})

export type ListRoute = typeof list

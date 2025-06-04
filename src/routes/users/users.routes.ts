import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema, IdParamsSchema } from 'stoker/openapi/schemas'
import { InsertUsersSchema, PatchUsersSchema, SelectUsersSchema } from '@/db/schema/users'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'

const tags = ['Users']

export const list = createRoute({
	path: '/users',
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SelectUsersSchema), 'The list of users'),
	},
})

export type ListRoute = typeof list;
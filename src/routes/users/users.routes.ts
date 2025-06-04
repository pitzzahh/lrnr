import { INSERT_USERS_SCHEMA, SELECT_USERS_SCHEMA } from '@/db/schema/users'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema } from 'stoker/openapi/schemas'
const tags = ['Users']
const path = '/users'

export const list = createRoute({
	path,
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SELECT_USERS_SCHEMA), 'The list of users'),
	},
})

export const create = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(INSERT_USERS_SCHEMA, 'The user to create'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_USERS_SCHEMA, 'The created user'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(INSERT_USERS_SCHEMA),
			'The validation error(s) for the user creation request'
		),
	},
})

export type ListRoute = typeof list
export type CreateRoute = typeof create

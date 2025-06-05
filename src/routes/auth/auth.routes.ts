import { SELECT_USERS_SCHEMA } from '@/db/schema/users'
import { SIGNIN_SCHEMA, SIGNUP_SCHEMA } from '@/lib/auth'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { IdUUIDParamsSchema, createErrorSchema } from 'stoker/openapi/schemas'
const tags = ['Auth']
const path = '/users'

export const signin = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(SIGNIN_SCHEMA, 'The user credentials for signing in'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_USERS_SCHEMA, 'The signed in user'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(SIGNIN_SCHEMA),
			'The validation error(s) for the signin request'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(NOT_FOUND_SCHEMA, 'Invalid credentials for signin'),
	},
})

export const signup = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(SIGNUP_SCHEMA, 'The user credentials for signing up'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(SELECT_USERS_SCHEMA, 'The newly created user'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(SIGNUP_SCHEMA),
			'The validation error(s) for the signup request'
		),
		[HttpStatusCodes.CONFLICT]: jsonContent(NOT_FOUND_SCHEMA, 'User already exists'),
	},
})

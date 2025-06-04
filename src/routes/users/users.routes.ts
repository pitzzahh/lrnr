import { INSERT_USERS_SCHEMA, SELECT_USERS_SCHEMA, PATCH_USERS_SCHEMA } from '@/db/schema/users'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema, IdUUIDParamsSchema } from 'stoker/openapi/schemas'
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

export const getOne = createRoute({
	path: `${path}/{id}`,
	method: 'get',
	request: {
		params: IdUUIDParamsSchema,
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_USERS_SCHEMA, 'The requested user'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested user not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			'Invalid id error'
		),
	},
})

export const patch = createRoute({
	path: `${path}/{id}`,
	method: 'patch',
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContentRequired(PATCH_USERS_SCHEMA, 'The user to update'),
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_USERS_SCHEMA, 'The updated user'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested user not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(PATCH_USERS_SCHEMA).or(createErrorSchema(IdUUIDParamsSchema)),
			'The validation error(s)'
		),
	},
})

export const remove = createRoute({
	path: `${path}/{id}`,
	method: 'delete',
	tags,
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HttpStatusCodes.GONE]: jsonContent(SELECT_USERS_SCHEMA, 'The deleted user'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested user not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			'Invalid id error'
		),
	},
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove

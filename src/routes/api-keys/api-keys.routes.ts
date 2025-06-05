import {
	INSERT_API_KEYS_SCHEMA,
	PATCH_API_KEYS_SCHEMA,
	PUBLIC_API_KEYS_SCHEMA,
} from '@/db/schema/api-keys'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { IdUUIDParamsSchema, createErrorSchema } from 'stoker/openapi/schemas'

const tags = ['API Keys']
const path = '/api-keys'

// Response schema for created API key (includes the actual key)
const CREATE_API_KEY_RESPONSE_SCHEMA = PUBLIC_API_KEYS_SCHEMA.extend({
	key: z.string().describe('The actual API key - only shown once at creation'),
})

export const list = createRoute({
	path,
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(PUBLIC_API_KEYS_SCHEMA),
			'The list of API keys for the authenticated user'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to API keys'
		),
	},
})

export const create = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(
			INSERT_API_KEYS_SCHEMA.omit({ user_id: true, key_hash: true, key_prefix: true }),
			'The API key to create'
		),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			CREATE_API_KEY_RESPONSE_SCHEMA,
			'The created API key with the actual key value'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized to create API keys'
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(INSERT_API_KEYS_SCHEMA),
			'The validation error(s) for the API key creation request'
		),
	},
})

export const getOne = createRoute({
	path: `${path}/{id}`,
	method: 'get',
	tags,
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(PUBLIC_API_KEYS_SCHEMA, 'The requested API key'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'API key not found'),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to this API key'
		),
	},
})

export const patch = createRoute({
	path: `${path}/{id}`,
	method: 'patch',
	tags,
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContentRequired(PATCH_API_KEYS_SCHEMA, 'The API key updates'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(PUBLIC_API_KEYS_SCHEMA, 'The updated API key'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'API key not found'),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized to update this API key'
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(PATCH_API_KEYS_SCHEMA),
			'The validation error(s) for the API key update request'
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
		[HttpStatusCodes.NO_CONTENT]: {
			description: 'API key deleted successfully',
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'API key not found'),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized to delete this API key'
		),
	},
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove

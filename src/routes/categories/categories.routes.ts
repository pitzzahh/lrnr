import {
	INSERT_CATEGORIES_SCHEMA,
	PATCH_CATEGORIES_SCHEMA,
	SELECT_CATEGORIES_SCHEMA,
} from '@/db/schema/categories'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { IdUUIDParamsSchema, createErrorSchema } from 'stoker/openapi/schemas'
const tags = ['Categories']
const path = '/categories'

export const list = createRoute({
	path,
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SELECT_CATEGORIES_SCHEMA), 'The list of categories'),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to categories'
		),
	},
})

export const create = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(INSERT_CATEGORIES_SCHEMA, 'The category to create'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_CATEGORIES_SCHEMA, 'The created category'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(INSERT_CATEGORIES_SCHEMA),
			'The validation error(s) for the category creation request'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to category creation'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to category creation (only admins and teachers can create categories)'
		),
		[HttpStatusCodes.CONFLICT]: jsonContent(
			createErrorSchema(INSERT_CATEGORIES_SCHEMA),
			'Conflict error, category with the same name already exists'
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
		[HttpStatusCodes.OK]: jsonContent(SELECT_CATEGORIES_SCHEMA, 'The requested category'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested category not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			'Invalid id error'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to the category'
		),
	},
})

export const patch = createRoute({
	path: `${path}/{id}`,
	method: 'patch',
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContentRequired(PATCH_CATEGORIES_SCHEMA, 'The category to update'),
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_CATEGORIES_SCHEMA, 'The updated category'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested category not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(PATCH_CATEGORIES_SCHEMA).or(createErrorSchema(IdUUIDParamsSchema)),
			'The validation error(s)'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to the category update'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to category update (only admins and teachers can update categories)'
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
		[HttpStatusCodes.GONE]: jsonContent(SELECT_CATEGORIES_SCHEMA, 'The deleted category'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested category not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			'Invalid id error'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to the category deletion'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to category deletion (only admins and teachers can delete categories)'
		),
	},
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove

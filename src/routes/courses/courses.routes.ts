import {
	INSERT_COURSES_SCHEMA,
	PATCH_COURSES_SCHEMA,
	SELECT_COURSES_SCHEMA,
} from '@/db/schema/courses'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { IdUUIDParamsSchema, createErrorSchema } from 'stoker/openapi/schemas'
const tags = ['Courses']
const path = '/courses'

export const list = createRoute({
	path,
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SELECT_COURSES_SCHEMA), 'The list of courses'),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(NOT_FOUND_SCHEMA, 'Unauthorized access to courses'),
	},
})

export const create = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(INSERT_COURSES_SCHEMA, 'The course to create'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_COURSES_SCHEMA, 'The created course'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(INSERT_COURSES_SCHEMA),
			'The validation error(s) for the course creation request'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to course creation'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to course creation (only admins and teachers allowed)'
		),
		[HttpStatusCodes.CONFLICT]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Conflict error (e.g., course with the same name already exists)'
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
		[HttpStatusCodes.OK]: jsonContent(SELECT_COURSES_SCHEMA, 'The requested course'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested course not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			'Invalid id error'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to the requested course'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to the requested course (e.g., user does not have permission)'
		),
	},
})

export const patch = createRoute({
	path: `${path}/{id}`,
	method: 'patch',
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContentRequired(PATCH_COURSES_SCHEMA, 'The course to update'),
	},
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_COURSES_SCHEMA, 'The updated course'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested course not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(PATCH_COURSES_SCHEMA).or(createErrorSchema(IdUUIDParamsSchema)),
			'The validation error(s)'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to the course update'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to the course update (only admins and teachers allowed)'
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
		[HttpStatusCodes.GONE]: jsonContent(SELECT_COURSES_SCHEMA, 'The deleted course'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Requested course not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			'Invalid id error'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to the course deletion'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to the course deletion (only admins and teachers allowed)'
		),
	},
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove

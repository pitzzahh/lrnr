import {
	INSERT_ENROLLMENTS_SCHEMA,
	PATCH_ENROLLMENTS_SCHEMA,
	SELECT_ENROLLMENTS_SCHEMA,
} from '@/db/schema/enrollments'
import { NOT_FOUND_SCHEMA } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema } from 'stoker/openapi/schemas'

const tags = ['Enrollments']
const path = '/enrollments'

const EnrollmentParamsSchema = z.object({
	user_id: z.string().uuid(),
	course_id: z.string().uuid(),
})

export const list = createRoute({
	path,
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(SELECT_ENROLLMENTS_SCHEMA),
			'The list of enrollments'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to enrollments'
		),
	},
})

export const create = createRoute({
	path,
	method: 'post',
	tags,
	request: {
		body: jsonContentRequired(INSERT_ENROLLMENTS_SCHEMA, 'The enrollment to create'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_ENROLLMENTS_SCHEMA, 'The created enrollment'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(INSERT_ENROLLMENTS_SCHEMA),
			'The validation error(s) for the enrollment creation request'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to enrollment creation'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to enrollment creation'
		),
		[HttpStatusCodes.CONFLICT]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Conflict error (e.g., user already enrolled in this course)'
		),
	},
})

export const getOne = createRoute({
	path: `${path}/{user_id}/{course_id}`,
	method: 'get',
	tags,
	request: {
		params: EnrollmentParamsSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_ENROLLMENTS_SCHEMA, 'The requested enrollment'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Enrollment not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(EnrollmentParamsSchema),
			'Invalid user_id or course_id'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to enrollment'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(NOT_FOUND_SCHEMA, 'Forbidden access to enrollment'),
	},
})

export const patch = createRoute({
	path: `${path}/{user_id}/{course_id}`,
	method: 'patch',
	tags,
	request: {
		params: EnrollmentParamsSchema,
		body: jsonContentRequired(PATCH_ENROLLMENTS_SCHEMA, 'The enrollment updates'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(SELECT_ENROLLMENTS_SCHEMA, 'The updated enrollment'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Enrollment not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(PATCH_ENROLLMENTS_SCHEMA).or(createErrorSchema(EnrollmentParamsSchema)),
			'The validation error(s)'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to enrollment update'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to enrollment update'
		),
	},
})

export const remove = createRoute({
	path: `${path}/{user_id}/{course_id}`,
	method: 'delete',
	tags,
	request: {
		params: EnrollmentParamsSchema,
	},
	responses: {
		[HttpStatusCodes.NO_CONTENT]: {
			description: 'Enrollment deleted',
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(NOT_FOUND_SCHEMA, 'Enrollment not found'),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(EnrollmentParamsSchema),
			'Invalid user_id or course_id'
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Unauthorized access to enrollment deletion'
		),
		[HttpStatusCodes.FORBIDDEN]: jsonContent(
			NOT_FOUND_SCHEMA,
			'Forbidden access to enrollment deletion'
		),
	},
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove

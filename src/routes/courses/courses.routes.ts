import { SELECT_COURSES_SCHEMA } from '@/db/schema/courses'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
const tags = ['Courses']

export const list = createRoute({
	path: '/courses',
	method: 'get',
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(SELECT_COURSES_SCHEMA), 'The list of courses'),
	},
})

export type ListRoute = typeof list

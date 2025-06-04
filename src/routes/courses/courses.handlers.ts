import db from '@/db'
import type { AppRouteHandler } from '@/lib/types'
import type { ListRoute, CreateRoute, GetOneRoute, PatchRoute, RemoveRoute } from './courses.routes'
import { courses } from '@/db/schema'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { eq } from 'drizzle-orm'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	return c.json(await db.query.courses.findMany())
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const course = c.req.valid('json')
	const [inserted_course] = await db.insert(courses).values(course).returning()
	return c.json(inserted_course, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const { id } = c.req.valid('param')
	const course = await db.query.courses.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})
	if (!course) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(course, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
	const { id } = c.req.valid('param')
	const updates = c.req.valid('json')

	if (Object.keys(updates).length === 0) {
		return c.json(
			{
				success: false,
				error: {
					issues: [
						{
							code: ZOD_ERROR_CODES.INVALID_UPDATES,
							path: [],
							message: ZOD_ERROR_MESSAGES.NO_UPDATES,
						},
					],
					name: 'ZodError',
				},
			},
			HttpStatusCodes.UNPROCESSABLE_ENTITY
		)
	}

	const [updated_course] = await db
		.update(courses)
		.set(updates)
		.where(eq(courses.id, id))
		.returning()

	if (!updated_course) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	return c.json(updated_course, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const { id } = c.req.valid('param')
	const [result] = await db.delete(courses).where(eq(courses.id, id)).returning()
	if (!result) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(result, HttpStatusCodes.GONE)
}

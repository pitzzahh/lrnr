import db from '@/db'
import { users } from '@/db/schema'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import { eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './users.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	return c.json(await db.query.users.findMany())
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const user = c.req.valid('json')
	const [inserted_user] = await db.insert(users).values(user).returning()
	return c.json(inserted_user, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const { id } = c.req.valid('param')
	const user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})
	if (!user) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(user, HttpStatusCodes.OK)
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

	const [updated_user] = await db.update(users).set(updates).where(eq(users.id, id)).returning()

	if (!updated_user) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	return c.json(updated_user, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const { id } = c.req.valid('param')
	const [result] = await db.delete(users).where(eq(users.id, id)).returning()
	if (!result) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(result, HttpStatusCodes.OK)
}

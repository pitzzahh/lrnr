import db from '@/db'
import { categories } from '@/db/schema'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import { eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type {
	CreateRoute,
	GetOneRoute,
	ListRoute,
	PatchRoute,
	RemoveRoute,
} from './categories.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`categories/list: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	return c.json(await db.query.categories.findMany(), HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`categories/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	// Only admins and teachers can create categories
	if (!['ADMIN', 'TEACHER'].includes(current_user.role)) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
	const category = c.req.valid('json')
	const [inserted_category] = await db.insert(categories).values(category).returning()
	return c.json(inserted_category, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const current_user = c.get('user')
	if (!current_user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const { id } = c.req.valid('param')
	const category = await db.query.categories.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})
	if (!category) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(category, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`categories/patch: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	// Only admins and teachers can update categories
	if (!['ADMIN', 'TEACHER'].includes(current_user.role)) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
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

	const [updated_category] = await db
		.update(categories)
		.set(updates)
		.where(eq(categories.id, id))
		.returning()

	if (!updated_category) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	return c.json(updated_category, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`categories/remove: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	// Only admins and teachers can update categories
	if (!['ADMIN', 'TEACHER'].includes(current_user.role)) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
	const { id } = c.req.valid('param')
	const [result] = await db.delete(categories).where(eq(categories.id, id)).returning()
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

import db from '@/db'
import { users } from '@/db/schema'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import { eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './users.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`users/list: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	if (current_user.role !== 'ADMIN') {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
	return c.json(await db.query.users.findMany(), HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`users/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const user = c.req.valid('json')
	const [inserted_user] = await db.insert(users).values(user).returning()
	return c.json(inserted_user, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`users/getOne: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const { id } = c.req.valid('param')

	// Users can view their own profile, admins can view anyone
	if (current_user.id !== id && current_user.role !== 'ADMIN') {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}

	const requested_user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})
	if (!requested_user) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(requested_user, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`users/patch: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const { id } = c.req.valid('param')
	const updates = c.req.valid('json')

	// Users can only update their own profile, admins can update anyone
	if (current_user.id !== id && current_user.role !== 'ADMIN') {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}

	// Prevent non-admins from changing roles
	if (updates.role && current_user.role !== 'ADMIN') {
		return c.json({ message: 'Only admins can change user roles' }, HttpStatusCodes.FORBIDDEN)
	}

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
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`users/remove: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const { id } = c.req.valid('param')

	// Get the user to be deleted first
	const user_to_delete = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})

	if (!user_to_delete) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	// Users can delete their own account
	const is_own_account = current_user.id === id

	// Role hierarchy check: prevent deletion of admin accounts
	if (user_to_delete.role === 'ADMIN') {
		return c.json({ message: 'Admin accounts cannot be deleted' }, HttpStatusCodes.FORBIDDEN)
	}

	// Students can only delete their own account
	if (current_user.role === 'STUDENT' && !is_own_account) {
		return c.json(
			{ message: 'Students can only delete their own account' },
			HttpStatusCodes.FORBIDDEN
		)
	}

	// Students cannot delete teacher or admin accounts (already covered by own account check)
	if (current_user.role === 'STUDENT' && user_to_delete.role !== 'STUDENT') {
		return c.json(
			{ message: 'Students cannot delete accounts with higher roles' },
			HttpStatusCodes.FORBIDDEN
		)
	}

	// Teachers can delete their own account or student accounts
	if (current_user.role === 'TEACHER' && !is_own_account && user_to_delete.role !== 'STUDENT') {
		return c.json(
			{ message: 'Teachers can only delete student accounts or their own account' },
			HttpStatusCodes.FORBIDDEN
		)
	}

	// Admins can delete any account except other admin accounts (already covered above)
	// No additional checks needed for admins

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

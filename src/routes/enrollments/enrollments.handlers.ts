import db from '@/db'
import { enrollments } from '@/db/schema'
import { ZOD_ERROR_CODES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import { and, eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type {
	CreateRoute,
	GetOneRoute,
	ListRoute,
	PatchRoute,
	RemoveRoute,
} from './enrollments.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`enrollments/list: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	// Users can only see their own enrollments, admins can see all
	const user_enrollments = await db.query.enrollments.findMany({
		where: current_user?.role === 'ADMIN' ? undefined : eq(enrollments.user_id, current_user.id),
	})

	return c.json(user_enrollments, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`enrollments/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const enrollment = c.req.valid('json')

	// Users can only enroll themselves unless they're admin
	if (current_user?.role !== 'ADMIN' && enrollment.user_id !== current_user?.id) {
		return c.json(
			{
				message: HttpStatusPhrases.FORBIDDEN,
			},
			HttpStatusCodes.FORBIDDEN
		)
	}

	// Check if user is already enrolled in this course
	const existingEnrollment = await db.query.enrollments.findFirst({
		where: and(
			eq(enrollments.user_id, enrollment.user_id),
			eq(enrollments.course_id, enrollment.course_id)
		),
	})

	if (existingEnrollment) {
		return c.json(
			{
				message: 'User is already enrolled in this course',
			},
			HttpStatusCodes.CONFLICT
		)
	}

	try {
		const [createdEnrollment] = await db
			.insert(enrollments)
			.values({
				...enrollment,
				enrolled_at: new Date(),
			})
			.returning()

		return c.json(createdEnrollment, HttpStatusCodes.OK)
	} catch (error: unknown) {
		if (error && typeof error === 'object' && 'constraint' in error) {
			return c.json(
				{
					success: false,
					error: {
						issues: [
							{
								code: ZOD_ERROR_CODES.CUSTOM,
								path: [],
								message: 'Database constraint violation',
							},
						],
						name: 'ZodError',
					},
				},
				HttpStatusCodes.UNPROCESSABLE_ENTITY
			)
		}
		throw error
	}
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`enrollments/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const { user_id, course_id } = c.req.valid('param')

	const enrollment = await db.query.enrollments.findFirst({
		where: and(eq(enrollments.user_id, user_id), eq(enrollments.course_id, course_id)),
	})

	if (!enrollment) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	// Users can only see their own enrollment unless they're admin
	if (current_user?.role !== 'ADMIN' && enrollment.user_id !== current_user?.id) {
		return c.json(
			{
				message: HttpStatusPhrases.FORBIDDEN,
			},
			HttpStatusCodes.FORBIDDEN
		)
	}

	return c.json(enrollment, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`enrollments/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	const { user_id, course_id } = c.req.valid('param')
	const updates = c.req.valid('json')

	const enrollment = await db.query.enrollments.findFirst({
		where: and(eq(enrollments.user_id, user_id), eq(enrollments.course_id, course_id)),
	})

	if (!enrollment) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	// Users can only update their own enrollment unless they're admin
	if (current_user?.role !== 'ADMIN' && enrollment.user_id !== current_user?.id) {
		return c.json(
			{
				message: HttpStatusPhrases.FORBIDDEN,
			},
			HttpStatusCodes.FORBIDDEN
		)
	}

	// Prevent users from changing user_id or course_id unless they're admin
	if (current_user?.role !== 'ADMIN' && (updates.user_id || updates.course_id)) {
		return c.json(
			{
				message: HttpStatusPhrases.FORBIDDEN,
			},
			HttpStatusCodes.FORBIDDEN
		)
	}

	try {
		const [updatedEnrollment] = await db
			.update(enrollments)
			.set(updates)
			.where(and(eq(enrollments.user_id, user_id), eq(enrollments.course_id, course_id)))
			.returning()

		return c.json(updatedEnrollment, HttpStatusCodes.OK)
	} catch (error: unknown) {
		if (error && typeof error === 'object' && 'constraint' in error) {
			return c.json(
				{
					success: false,
					error: {
						issues: [
							{
								code: ZOD_ERROR_CODES.CUSTOM,
								path: [],
								message: 'Database constraint violation',
							},
						],
						name: 'ZodError',
					},
				},
				HttpStatusCodes.UNPROCESSABLE_ENTITY
			)
		}
		throw error
	}
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`enrollments/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	const { user_id, course_id } = c.req.valid('param')

	const enrollment = await db.query.enrollments.findFirst({
		where: and(eq(enrollments.user_id, user_id), eq(enrollments.course_id, course_id)),
	})

	if (!enrollment) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}

	// Users can only delete their own enrollment unless they're admin
	if (current_user?.role !== 'ADMIN' && enrollment.user_id !== current_user?.id) {
		return c.json(
			{
				message: HttpStatusPhrases.FORBIDDEN,
			},
			HttpStatusCodes.FORBIDDEN
		)
	}

	await db
		.delete(enrollments)
		.where(and(eq(enrollments.user_id, user_id), eq(enrollments.course_id, course_id)))

	return c.body(null, HttpStatusCodes.NO_CONTENT)
}

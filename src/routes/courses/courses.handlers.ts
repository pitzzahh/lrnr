import db from '@/db'
import { courses } from '@/db/schema'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import { eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './courses.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`courses/list: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}
	return c.json(await db.query.courses.findMany(), HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`courses/create: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
	)
	if (!current_user || !current_session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	// Only admins and teachers can create courses
	if (!['ADMIN', 'TEACHER'].includes(current_user.role)) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
	const course = c.req.valid('json')
	// Set the creator as the teacher if not specified and user is a teacher
	if (current_user.role === 'TEACHER') {
		course.teacher_id = current_user.id
	}
	const [inserted_course] = await db.insert(courses).values(course).returning()
	return c.json(inserted_course, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`courses/getOne: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
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

	// TODO: Check if user has access to this course
	// TODO: Students should only see courses they're enrolled in (you'd need to check enrollments table)
	// TODO: Teachers can see their own courses + admin can see all
	if (current_user.role === 'STUDENT') {
		// TODO: Add enrollment check here when you have enrollment logic
		// TODO: const enrollment = await checkEnrollment(current_user.id, course.id)
		// TODO: if (!enrollment) return forbidden
	} else if (current_user.role === 'TEACHER' && course.teacher_id !== current_user.id) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
	return c.json(course, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`courses/patch: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
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
	// Get the course first to check ownership
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

	// Only course owner (teacher) or admin can update
	if (current_user.role !== 'ADMIN' && course.teacher_id !== current_user.id) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}
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
	const current_user = c.get('user')
	const current_session = c.get('session')
	c.var.logger.debug(
		`courses/remove: user=${current_user ? current_user.id : 'none'}, session=${current_session ? current_session.id : 'none'}`
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

	// Get the course first to check ownership
	const course = await db.query.courses.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})

	if (!course) {
		return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND)
	}

	// Only course owner (teacher) or admin can delete
	if (current_user.role !== 'ADMIN' && course.teacher_id !== current_user.id) {
		return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
	}

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

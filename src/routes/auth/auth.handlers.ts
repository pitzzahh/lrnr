import db from '@/db'
import { users } from '@/db/schema'
import {
	create_session,
	delete_session_token_cookie,
	generate_session_token,
	invalidate_session,
	set_session_token_cookie,
} from '@/lib/auth'
import { ZOD_ERROR_CODES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type { LogoutRoute, SigninRoute, SignupRoute } from './auth.routes'

export const signin: AppRouteHandler<SigninRoute> = async (c) => {
	const { email, password } = c.req.valid('json')
	c.var.logger.debug(`auth/signin: email=${email}, password=[REDACTED]`)

	const user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.email, email)
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

	const is_valid_password = await Bun.password.verify(password, user?.password_hash)
	c.var.logger.debug(`auth/signin: is_valid_password=${is_valid_password}`)
	if (!is_valid_password) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	try {
		const token = generate_session_token()
		c.var.logger.debug(`auth/signin: generated token=${token}`)

		const session = await create_session(c, token, user.id)
		c.var.logger.debug(`auth/signin: created session=${JSON.stringify(session)}`)

		set_session_token_cookie(c, token, session.expires_at)
		c.var.logger.debug(
			`auth/signin: session cookie set for user_id=${user.id}, session_id=${session.id}`
		)
		const { password_hash: _, ...user_password_redacted } = user
		c.set('user', user_password_redacted)
		c.set('session', session)
		return c.json(user_password_redacted, HttpStatusCodes.OK)
	} catch {
		return c.json(
			{
				success: false,
				error: {
					issues: [
						{
							code: ZOD_ERROR_CODES.CUSTOM,
							path: [],
							message: 'An error occurred while processing the signin request',
						},
					],
					name: 'ZodError',
				},
			},
			HttpStatusCodes.INTERNAL_SERVER_ERROR
		)
	}
}

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
	const { name, email, password } = c.req.valid('json')

	// Check if user already exists
	const existingUser = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.email, email)
		},
	})
	c.var.logger.debug('Existing user check:', {
		email,
		exists: !!existingUser,
		existingUser,
	})
	if (existingUser) {
		return c.json(
			{
				message: 'User already exists',
			},
			HttpStatusCodes.CONFLICT
		)
	}

	try {
		const password_hash = await Bun.password.hash(password)

		const [newUser] = await db
			.insert(users)
			.values({
				name,
				email,
				password_hash,
			})
			.returning()

		// Return user without password_hash
		const { password_hash: _, ...userWithoutPassword } = newUser
		return c.json(userWithoutPassword, HttpStatusCodes.CREATED)
	} catch {
		// If there's an error during insertion, it's likely a conflict
		return c.json(
			{
				message: 'User already exists',
			},
			HttpStatusCodes.CONFLICT
		)
	}
}

export const logout: AppRouteHandler<LogoutRoute> = async (c) => {
	const user = c.get('user')
	const session = c.get('session')

	if (!user || !session) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	try {
		await invalidate_session(session.id)
		delete_session_token_cookie(c)

		return c.json(
			{
				message: 'Successfully logged out',
			},
			HttpStatusCodes.OK
		)
	} catch {
		return c.json(
			{
				success: false,
				error: {
					issues: [
						{
							code: ZOD_ERROR_CODES.CUSTOM,
							path: [],
							message: 'An error occurred while processing the logout request',
						},
					],
					name: 'ZodError',
				},
			},
			HttpStatusCodes.INTERNAL_SERVER_ERROR
		)
	}
}

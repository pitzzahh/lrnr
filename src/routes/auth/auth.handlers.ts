import db from '@/db'
import { users } from '@/db/schema'
import {
	create_session,
	deleteSessionTokenCookie,
	generate_session_token,
	hashPassword,
	invalidateSession,
	setSessionTokenCookie,
	verifyPassword,
} from '@/lib/auth'
import { ZOD_ERROR_CODES } from '@/lib/constants'
import type { AppRouteHandler } from '@/lib/types'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import type { LogoutRoute, SigninRoute, SignupRoute } from './auth.routes'

export const signin: AppRouteHandler<SigninRoute> = async (c) => {
	const { email, password } = c.req.valid('json')

	const user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.email, email)
		},
	})

	if (!user || !(await verifyPassword(password, user.password_hash))) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED
		)
	}

	try {
		const token = generate_session_token()
		const session = await create_session(token, user.id)
		setSessionTokenCookie(c, token, session.expires_at)

		// Return user without password_hash
		const { password_hash: _, ...userWithoutPassword } = user
		return c.json(userWithoutPassword, HttpStatusCodes.OK)
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

	if (existingUser) {
		return c.json(
			{
				message: 'User already exists',
			},
			HttpStatusCodes.CONFLICT
		)
	}

	try {
		const password_hash = await hashPassword(password)

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
		await invalidateSession(session.id)
		deleteSessionTokenCookie(c)

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

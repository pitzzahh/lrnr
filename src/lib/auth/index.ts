import db from '@/db'
import { sessions, users } from '@/db/schema'
import type { Session } from '@/db/schema/sessions'
import type { User } from '@/db/schema/users'
import env from '@/env'
import type { AppBindings } from '@/lib/types'
import { z } from '@hono/zod-openapi'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'

const MINUTES_MS = 1000 * 60
const HOURS_MS = MINUTES_MS * 60
const DAYS_MS = HOURS_MS * 24

const SESSION_REFRESH_INTERVAL_MS = DAYS_MS * 15
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2

export const SESSION_COOKIE_NAME = 'session'
export const SIGNIN_SCHEMA = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(100),
})

export const SIGNUP_SCHEMA = SIGNIN_SCHEMA.extend({
	name: z.string().min(1).max(500),
	password_confirmation: z.string().min(8).max(100),
}).refine((data) => data.password === data.password_confirmation, {
	message: 'Passwords do not match',
})

export function generate_session_token(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function create_session(
	c: Context<AppBindings>,
	token: string,
	user_id: string
): Promise<Session> {
	try {
		const session_id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
		c.var.logger.debug(`Creating session id=${session_id} for user_id=${user_id}`)

		// Clean up any existing sessions for this user (due to unique constraint on user_id)
		// Only delete expired sessions first, then delete any remaining ones
		const existingSessions = await db.query.sessions.findMany({
			where: (sessions, { eq }) => eq(sessions.user_id, user_id),
		})

		for (const existingSession of existingSessions) {
			if (Date.now() >= existingSession.expires_at.getTime()) {
				c.var.logger.debug(`Deleting expired session id=${existingSession.id}`)
				await db.delete(sessions).where(eq(sessions.id, existingSession.id))
			} else {
				c.var.logger.debug(
					`Deleting existing valid session id=${existingSession.id} to create new one`
				)
				await db.delete(sessions).where(eq(sessions.id, existingSession.id))
			}
		}

		// Create new session
		const session: Session = {
			id: session_id,
			user_id,
			expires_at: new Date(Date.now() + SESSION_MAX_DURATION_MS),
		}
		await db.insert(sessions).values(session)
		c.var.logger.debug(`Successfully created new session id=${session_id} for user_id=${user_id}`)
		return session
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		c.var.logger.error(`Failed to create session: ${errorMessage}`)
		throw new Error('Failed to create session', { cause: error })
	}
}

export async function validate_session_token(
	token: string,
	c: Context<AppBindings>
): Promise<SessionValidationResult> {
	const session_id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	c.var.logger.debug('Validating session token', {
		token,
		session_id,
	})
	const [result] = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.user_id, users.id))
		.where(eq(sessions.id, session_id))

	if (!result) {
		return { session: null, user: null }
	}

	const { user, session } = result

	if (Date.now() >= session.expires_at.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id))
		return { session: null, user: null }
	}

	if (Date.now() >= session.expires_at.getTime() - SESSION_REFRESH_INTERVAL_MS) {
		session.expires_at = new Date(Date.now() + SESSION_MAX_DURATION_MS)
		await db
			.update(sessions)
			.set({ expires_at: session.expires_at })
			.where(eq(sessions.id, session.id))
	}
	return { session, user }
}

export async function invalidate_session(session_id: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, session_id))
}

export async function invalidate_user_session(user_id: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.user_id, user_id))
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null }

export function set_session_token_cookie(c: Context<AppBindings>, token: string, expires_at: Date) {
	console.log('set_session_token_cookie called with:', {
		token,
		expires_at: expires_at.toUTCString(),
		NODE_ENV: env.NODE_ENV,
	})

	c.var.logger.debug(
		`Setting session cookie for token=${token} expires_at=${expires_at.toUTCString()}`
	)

	try {
		if (env.NODE_ENV === 'production') {
			setCookie(c, SESSION_COOKIE_NAME, token, {
				httpOnly: true,
				sameSite: 'Lax',
				expires: expires_at,
				path: '/',
				secure: true,
			})
		} else {
			setCookie(c, SESSION_COOKIE_NAME, token, {
				httpOnly: true,
				sameSite: 'Lax',
				expires: expires_at,
				path: '/',
			})
		}

		console.log('Cookie set successfully using setCookie')
		c.var.logger.debug('Session cookie set successfully')
	} catch (error) {
		console.error('Error setting cookie:', error)
		c.var.logger.error('Failed to set session cookie:', error)
		throw error
	}
}

export function delete_session_token_cookie(c: Context<AppBindings>): void {
	c.var.logger.debug('Deleting session token cookie')
	try {
		deleteCookie(c, SESSION_COOKIE_NAME, {
			httpOnly: true,
			sameSite: 'Lax',
			maxAge: 0,
			path: '/',
			...(env.NODE_ENV === 'production' && { secure: true }),
		})
		c.var.logger.debug('Session cookie deleted successfully')
	} catch (error) {
		c.var.logger.error('Failed to delete session cookie:', error)
		throw error
	}
}

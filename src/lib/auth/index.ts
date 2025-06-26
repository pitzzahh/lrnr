import db from '@/db'
import { api_keys, sessions, users } from '@/db/schema'
import type { ApiKey } from '@/db/schema/api-keys'
import type { Session } from '@/db/schema/sessions'
import type { User } from '@/db/schema/users'
import env from '@/env'
import type { AppBindings } from '@/lib/types'
import { z } from '@hono/zod-openapi'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { and, eq } from 'drizzle-orm'
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

// API Key constants and schemas
export const API_KEY_PREFIX = 'lrnr_'
export const API_KEY_LENGTH = 32 // Length of the random part

export const CREATE_API_KEY_SCHEMA = z.object({
	name: z.string().min(1).max(100),
	expires_at: z.string().datetime().optional(),
})

// API Key functions
export function generate_api_key(): { key: string; hash: string; prefix: string } {
	// Generate random bytes for the key
	const bytes = new Uint8Array(API_KEY_LENGTH)
	crypto.getRandomValues(bytes)

	// Create the full key with prefix
	const randomPart = encodeBase32LowerCaseNoPadding(bytes)
	const key = `${API_KEY_PREFIX}${randomPart}`

	// Hash the key for storage
	const hash = encodeHexLowerCase(sha256(new TextEncoder().encode(key)))

	// Create prefix for identification (first 8 characters)
	const prefix = key.substring(0, 8)

	return { key, hash, prefix }
}

export async function create_api_key(
	c: Context<AppBindings>,
	user_id: string,
	name: string,
	expires_at?: Date
): Promise<{ api_key: ApiKey; key: string }> {
	try {
		const { key, hash, prefix } = generate_api_key()

		c.var.logger.debug(`Creating API key for user_id=${user_id}, name=${name}`)

		const [api_key] = await db
			.insert(api_keys)
			.values({
				name,
				key_hash: hash,
				key_prefix: prefix,
				user_id,
				expires_at,
			})
			.returning()

		c.var.logger.debug(`Created API key id=${api_key.id} for user_id=${user_id}`)

		return { api_key, key }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		c.var.logger.error(`Failed to create API key: ${errorMessage}`)
		throw new Error('Failed to create API key', { cause: error })
	}
}

export async function validate_api_key(
	key: string,
	c: Context<AppBindings>
): Promise<{ api_key: ApiKey | null; user: User | null }> {
	try {
		if (!key.startsWith(API_KEY_PREFIX)) {
			c.var.logger.debug('Invalid API key format - missing prefix')
			return { api_key: null, user: null }
		}

		const hash = encodeHexLowerCase(sha256(new TextEncoder().encode(key)))
		c.var.logger.debug(`Validating API key with hash=${hash.substring(0, 8)}...`)

		const result = await db.query.api_keys.findFirst({
			where: (api_keys, { eq, and, gt, isNull, or }) =>
				and(
					eq(api_keys.key_hash, hash),
					eq(api_keys.is_active, true),
					or(isNull(api_keys.expires_at), gt(api_keys.expires_at, new Date()))
				),
			with: {
				user: true,
			},
		})

		if (!result) {
			c.var.logger.debug('API key not found or expired')
			return { api_key: null, user: null }
		}

		// Update last_used_at
		await db.update(api_keys).set({ last_used_at: new Date() }).where(eq(api_keys.id, result.id))

		c.var.logger.debug(`Valid API key found for user_id=${result.user.id}`)

		return { api_key: result, user: result.user }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		c.var.logger.error(`Failed to validate API key: ${errorMessage}`)
		return { api_key: null, user: null }
	}
}

export async function revoke_api_key(
	c: Context<AppBindings>,
	api_key_id: string,
	user_id: string
): Promise<boolean> {
	try {
		c.var.logger.debug(`Revoking API key id=${api_key_id} for user_id=${user_id}`)

		const result = await db
			.update(api_keys)
			.set({ is_active: false })
			.where(and(eq(api_keys.id, api_key_id), eq(api_keys.user_id, user_id)))
			.returning()

		const success = result.length > 0
		if (success) {
			c.var.logger.debug(`Successfully revoked API key id=${api_key_id}`)
		} else {
			c.var.logger.debug(`API key id=${api_key_id} not found or not owned by user`)
		}

		return success
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		c.var.logger.error(`Failed to revoke API key: ${errorMessage}`)
		return false
	}
}

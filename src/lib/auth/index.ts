import db from '@/db'
import { sessions, users } from '@/db/schema'
import type { Session } from '@/db/schema/sessions'
import type { User } from '@/db/schema/users'
import type { AppBindings } from '@/lib/types'
import { z } from '@hono/zod-openapi'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15
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

export async function create_session(token: string, user_id: string): Promise<Session> {
	const session_id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	console.log('session_id at createSession', session_id)
	const session: Session = {
		id: session_id,
		user_id,
		expires_at: new Date(Date.now() + SESSION_MAX_DURATION_MS),
	}
	await db.insert(sessions).values(session)
	return session
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

export async function invalidateSession(session_id: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, session_id))
}

export async function invalidateUserSession(user_id: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.user_id, user_id))
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null }

export function setSessionTokenCookie(c: Context, token: string, expiresAt: Date) {
	console.log('set cookie', process.env.NODE_ENV)
	if (process.env.NODE_ENV === 'PROD') {
		c.header(
			'Set-Cookie',
			`${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`,
			{ append: true }
		)
	} else {
		c.header(
			'Set-Cookie',
			`${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`,
			{ append: true }
		)
	}
}

export function deleteSessionTokenCookie(c: Context<AppBindings>): void {
	if (process.env.NODE_ENV === 'PROD') {
		c.header(
			'Set-Cookie',
			`${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;`,
			{ append: true }
		)
	} else {
		c.header('Set-Cookie', `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`, {
			append: true,
		})
	}
}

export async function hashPassword(password: string): Promise<string> {
	return await Bun.password.hash(password, {
		algorithm: 'argon2id',
		memoryCost: 65536,
		timeCost: 2,
	})
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await Bun.password.verify(password, hash)
}

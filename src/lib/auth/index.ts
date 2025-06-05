import { eq } from 'drizzle-orm'
import db from '@/db'
import { sha256 } from '@oslojs/crypto/sha2'
import { sessions, users } from '@/db/schema'
import type { Sessions } from '@/db/schema/sessions'
import type { Users } from '@/db/schema/users'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2
export const SESSION_COOKIE_NAME = 'session'

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function createSession(token: string, user_id: string): Promise<Sessions> {
	const session_id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	console.log('session_id at createSession', session_id)
	const session: Sessions = {
		id: session_id,
		user_id,
		expires_at: new Date(Date.now() + SESSION_MAX_DURATION_MS),
	}
	await db.insert(sessions).values(session)
	return session
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	console.log('at validateSessionToken', { token, sessionId })
	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.user_id, users.id))
		.where(eq(sessions.id, sessionId))

	if (result.length < 1) {
		return { session: null, user: null }
	}

	const { user, session } = result[0]

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

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function invalidateUserSession(user_id: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.user_id, user_id))
}

export type SessionValidationResult =
	| { session: Sessions; user: Users }
	| { session: null; user: null }

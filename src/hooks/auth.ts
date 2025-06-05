import {
	SESSION_COOKIE_NAME,
	delete_session_token_cookie,
	generate_session_token,
	set_session_token_cookie,
	validate_session_token,
} from '@/lib/auth'
import type { AppBindings } from '@/lib/types'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const authentication = createMiddleware<AppBindings>(async (c, next) => {
	const sessionId = getCookie(c, SESSION_COOKIE_NAME) ?? null
	console.log('middlearwe running')
	console.log(sessionId)
	if (!sessionId) {
		c.set('user', null)
		c.set('session', null)
		return next()
	}
	const { session, user } = await validate_session_token(sessionId, c)
	if (session && !c.req.path.startsWith('/auth')) {
		const token = generate_session_token()
		set_session_token_cookie(c, token, session.expires_at)
	}
	if (!session) {
		delete_session_token_cookie(c)
	}
	c.set('user', user)
	c.set('session', session)
	return next()
})

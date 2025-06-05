import {
	SESSION_COOKIE_NAME,
	delete_session_token_cookie,
	generate_session_token,
	set_session_token_cookie,
	validate_session_token,
	validate_api_key,
} from '@/lib/auth'
import type { AppBindings } from '@/lib/types'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const authentication = createMiddleware<AppBindings>(async (c, next) => {
	// Try session authentication first
	const session_id = getCookie(c, SESSION_COOKIE_NAME) ?? null
	c.var.logger.debug(`middleware/authentication: session_id=${session_id}`)

	if (session_id) {
		const { session, user } = await validate_session_token(session_id, c)
		if (session && user) {
			// Refresh session if not on auth routes
			if (!c.req.path.startsWith('/auth')) {
				const token = generate_session_token()
				set_session_token_cookie(c, token, session.expires_at)
			}
			c.set('user', user)
			c.set('session', session)
			return next()
		}
		if (!session) {
			delete_session_token_cookie(c)
		}
	}

	// Try API key authentication
	const authHeader = c.req.header('Authorization')
	if (authHeader?.startsWith('Bearer ')) {
		const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
		c.var.logger.debug('middleware/authentication: trying API key authentication')

		const { api_key, user } = await validate_api_key(apiKey, c)
		if (api_key && user) {
			c.var.logger.debug(`API key authentication successful for user_id=${user.id}`)
			c.set('user', user)
			c.set('session', null) // No session for API key auth
			c.set('api_key', api_key)
			return next()
		}
	}

	// No authentication found
	c.set('user', null)
	c.set('session', null)
	return next()
})

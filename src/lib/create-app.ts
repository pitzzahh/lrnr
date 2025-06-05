import { authentication } from '@/hooks/auth'
import { logger } from '@/hooks/pino-logger'
import type { AppBindings } from '@/lib/types'
import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares'
import { defaultHook } from 'stoker/openapi'

export function createRouter() {
	return new OpenAPIHono<AppBindings>({ strict: false, defaultHook: defaultHook })
}

export default function createApp() {
	const app = createRouter()
	app.use('*', authentication)
	app.use(logger())
	app.use(serveEmojiFavicon('📚'))

	app.notFound(notFound)
	app.onError(onError)

	return app
}

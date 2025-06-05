import type { Sessions } from '@/db/schema/sessions'
import type { Users } from '@/db/schema/users'
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { PinoLogger } from 'hono-pino'

export type AppBindings = {
	Variables: {
		logger: PinoLogger
		user: Users | null
		session: Sessions | null
	}
}
export type AppOpenAPI = OpenAPIHono<AppBindings>
export type AppRouteHandler<RConfig extends RouteConfig> = RouteHandler<RConfig, AppBindings>

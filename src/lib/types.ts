import type { ApiKey } from '@/db/schema/api-keys'
import type { Session } from '@/db/schema/sessions'
import type { UserRedactedPassword } from '@/db/schema/users'
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { PinoLogger } from 'hono-pino'

export type AppBindings = {
	Variables: {
		logger: PinoLogger
		user: UserRedactedPassword | null
		session: Session | null
		api_key?: ApiKey | null
	}
}
export type AppOpenAPI = OpenAPIHono<AppBindings>
export type AppRouteHandler<RConfig extends RouteConfig> = RouteHandler<RConfig, AppBindings>

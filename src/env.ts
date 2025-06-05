import { z } from '@hono/zod-openapi'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'

expand(config())

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const

const EnvSchema = z.object({
	PORT: z.coerce.number().default(3000),
	NODE_ENV: z.enum(['development', 'production']).default('development'),
	LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
	DATABASE_HOST: z.string().min(1),
	DATABASE_PORT: z.coerce.number().min(1).default(5432),
	DATABASE_USER: z.string().min(1),
	DATABASE_PASSWORD: z.string().min(1),
	DATABASE_NAME: z.string().min(1),
})

export type env = z.infer<typeof EnvSchema>

let env: env

try {
	env = EnvSchema.parse(process.env)
} catch (err) {
	const error = err as z.ZodError
	console.error('Environment variable validation failed:', error.errors)
	console.error(error.flatten())
	process.exit(1)
}

export default env

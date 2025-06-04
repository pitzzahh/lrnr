import env from '@/env'
import { pinoLogger } from 'hono-pino'
import pino from 'pino'
import pretty from 'pino-pretty'

export function logger() {
	return pinoLogger({
		pino: pino(
			{
				level: env.LOG_LEVEL || 'info',
			},
			pretty({
				colorize: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname',
			})
		),
	})
}

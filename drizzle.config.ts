import env from '@/env'
import type { Config } from 'drizzle-kit'

export default {
	schema: './src/db/schema/index.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		ssl: false,
		host: env.DATABASE_HOST,
		port: Number(env.DATABASE_PORT),
		user: env.DATABASE_USER,
		password: env.DATABASE_PASSWORD,
		database: env.DATABASE_NAME,
	},
	verbose: true,
	strict: true,
} satisfies Config

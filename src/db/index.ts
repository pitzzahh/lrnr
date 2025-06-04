import 'dotenv/config'
import * as schema from '@/db/schema/index'
import env from '@/env'
import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'

const client = new SQL({
	host: env.DATABASE_HOST,
	port: env.DATABASE_PORT,
	user: env.DATABASE_USER,
	password: env.DATABASE_PASSWORD,
	database: env.DATABASE_NAME,
})

const db = drizzle({ client, schema, casing: 'snake_case' })

export default db

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/bun-sql'
import { SQL } from 'bun'
import env from '@/env'
import * as schema from '@/db/schema/index'

const client = new SQL({
	host: env.DATABASE_HOST,
	port: Number(env.DATABASE_PORT),
	user: env.DATABASE_USER,
	password: env.DATABASE_PASSWORD,
	database: env.DATABASE_NAME,
})

const db = drizzle({ client, schema })

export default db

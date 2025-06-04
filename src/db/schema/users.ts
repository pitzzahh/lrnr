import { pgTable } from 'drizzle-orm/pg-core'

const users = pgTable('users', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull(),
	email: t.text().notNull().unique(),
	passwordHash: t.text().notNull(),
	created_at: t.timestamp().defaultNow(),
}))

export default users

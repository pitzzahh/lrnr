import { pgTable } from 'drizzle-orm/pg-core'

const users = pgTable('users', (t) => ({
	id: t.uuid('id').primaryKey().defaultRandom(),
	name: t.text('name').notNull(),
	email: t.text('email').notNull().unique(),
	passwordHash: t.text('password_hash').notNull(),
	createdAt: t.timestamp('created_at').defaultNow(),
}))

export default users

import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

const users = pgTable('users', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull(),
	email: t.text().notNull().unique(),
	password_hash: t.text().notNull(),
	created_at: t.timestamp().defaultNow(),
}))

export const SELECT_USERS_SCHEMA = createSelectSchema(users)
export const INSERT_USERS_SCHEMA = createInsertSchema(users, {
	name: (s) => s.name.min(1).max(500),
	email: (s) => s.email.min(1).max(500).email(),
})
	.required({
		name: true,
		email: true,
		password_hash: true,
	})
	.omit({
		id: true,
		created_at: true,
	})

export const PATCH_USERS_SCHEMA = INSERT_USERS_SCHEMA.partial()

export type Users = typeof users.$inferSelect

export default users

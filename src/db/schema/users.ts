import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import role_name from './enums/role-name'

const users = pgTable('users', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull(),
	email: t.text().notNull().unique(),
	password_hash: t.text().notNull(),
	role: role_name().default('STUDENT').notNull(),
	created_at: t.timestamp({ withTimezone: true, mode: 'date' }).defaultNow(),
	updated_at: t
		.timestamp({ withTimezone: true, mode: 'date' })
		.defaultNow()
		.$onUpdate(() => new Date()),
}))

export const SELECT_USERS_SCHEMA = createSelectSchema(users)
export const PUBLIC_USERS_SCHEMA = SELECT_USERS_SCHEMA.omit({ password_hash: true })
export const INSERT_USERS_SCHEMA = createInsertSchema(users, {
	name: (s) => s.name.min(1).max(500),
	email: (s) => s.email.min(1).max(500).email(),
})
	.required({
		name: true,
		email: true,
		role: true,
		password_hash: true,
	})
	.omit({
		id: true,
		created_at: true,
	})

export const PATCH_USERS_SCHEMA = INSERT_USERS_SCHEMA.partial()

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert
export type UserRedactedPassword = Omit<User, 'password_hash'>

export default users

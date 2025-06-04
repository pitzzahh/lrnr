import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

const users = pgTable('users', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull(),
	email: t.text().notNull().unique(),
	passwordHash: t.text().notNull(),
	created_at: t.timestamp().defaultNow(),
}))

export const SelectUsersSchema = createSelectSchema(users)
export const InsertUsersSchema = createInsertSchema(users)
export const PatchUsersSchema = InsertUsersSchema.partial()

export default users

import { users } from '@/db/schema'
import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

const sessions = pgTable('sessions', (t) => ({
	id: t.text().primaryKey(),
	user_id: t
		.uuid()
		.unique()
		.notNull()
		.references(() => users.id),
	expires_at: t
		.timestamp({
			withTimezone: true,
			mode: 'date',
		})
		.notNull(),
}))

export const SELECT_SESSIONS_SCHEMA = createSelectSchema(sessions)
export const INSERT_SESSIONS_SCHEMA = createInsertSchema(sessions, {
	user_id: (s) => s.user_id.min(1).max(500),
}).required({
	user_id: true,
	expires_at: true,
})

export const PATCH_SESSIONS_SCHEMA = INSERT_SESSIONS_SCHEMA.partial()

export type Session = typeof sessions.$inferSelect
export type InsertSession = typeof sessions.$inferInsert

export default sessions

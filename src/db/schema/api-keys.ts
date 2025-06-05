import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users } from '.'

const api_keys = pgTable('api_keys', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull(), // User-friendly name for the key
	key_hash: t.text().notNull().unique(), // Hashed API key
	key_prefix: t.text().notNull(), // First 8 characters for identification
	user_id: t
		.uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	last_used_at: t.timestamp({ withTimezone: true, mode: 'date' }),
	expires_at: t.timestamp({ withTimezone: true, mode: 'date' }),
	is_active: t.boolean().notNull().default(true),
	created_at: t.timestamp({ withTimezone: true, mode: 'date' }).defaultNow(),
	updated_at: t
		.timestamp({ withTimezone: true, mode: 'date' })
		.defaultNow()
		.$onUpdate(() => new Date()),
}))

export const SELECT_API_KEYS_SCHEMA = createSelectSchema(api_keys)
export const PUBLIC_API_KEYS_SCHEMA = SELECT_API_KEYS_SCHEMA.omit({ key_hash: true })
export const INSERT_API_KEYS_SCHEMA = createInsertSchema(api_keys, {
	name: (s) => s.name.min(1).max(100),
})
	.required({
		name: true,
		user_id: true,
		key_hash: true,
		key_prefix: true,
	})
	.omit({
		id: true,
		created_at: true,
		updated_at: true,
	})

export const PATCH_API_KEYS_SCHEMA = INSERT_API_KEYS_SCHEMA.partial().omit({
	user_id: true,
	key_hash: true,
	key_prefix: true,
})

export type ApiKey = typeof api_keys.$inferSelect
export type InsertApiKey = typeof api_keys.$inferInsert
export type PublicApiKey = Omit<ApiKey, 'key_hash'>

export default api_keys

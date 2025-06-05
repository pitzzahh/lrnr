import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

const categories = pgTable('categories', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull().unique(),
	created_at: t.timestamp({ withTimezone: true, mode: 'date' }).defaultNow(),
}))

export const SELECT_CATEGORIES_SCHEMA = createSelectSchema(categories)
export const INSERT_CATEGORIES_SCHEMA = createInsertSchema(categories, {
	name: (s) => s.name.min(1).max(500),
})
	.required({
		name: true,
	})
	.omit({
		id: true,
		created_at: true,
	})

export const PATCH_CATEGORIES_SCHEMA = INSERT_CATEGORIES_SCHEMA.partial()

export default categories

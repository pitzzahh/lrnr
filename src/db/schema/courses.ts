import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users } from '.'

const courses = pgTable('courses', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	title: t.text().notNull(),
	description: t.text(),
	created_by: t.uuid().references(() => users.id),
	created_at: t.timestamp().defaultNow(),
}))

export const SELECT_COURSES_SCHEMA = createSelectSchema(courses)
export const INSERT_COURSES_SCHEMA = createInsertSchema(courses, {
	title: (s) => s.title.min(1).max(500),
	description: (s) => s.description.max(2000),
})
	.required({
		title: true,
	})
	.omit({
		id: true,
		created_at: true,
	})

export const PATCH_COURSES_SCHEMA = INSERT_COURSES_SCHEMA.partial()

export default courses

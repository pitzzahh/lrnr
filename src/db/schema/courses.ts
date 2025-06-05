import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users, categories } from '.'

const courses = pgTable('courses', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	title: t.text().notNull(),
	description: t.text(),
	created_at: t.timestamp().defaultNow(),
	updated_at: t
		.timestamp()
		.defaultNow()
		.$onUpdate(() => new Date()),
	thumbnail_url: t.text().notNull(),
	teacher_id: t.uuid().references(() => users.id),
	category_id: t.uuid().references(() => categories.id, {
		onDelete: 'set null',
		onUpdate: 'cascade',
	}),
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

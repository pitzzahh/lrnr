import { relations } from 'drizzle-orm'
import { categories, courses } from '..'

export const courses_relations = relations(courses, ({ one }) => {
	return {
		categories: one(categories, {
			fields: [courses.category_id],
			references: [categories.id],
		}),
	}
})

export default courses_relations

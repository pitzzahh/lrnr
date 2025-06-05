import { relations } from 'drizzle-orm'
import { categories, courses, enrollments, users } from '..'

export const courses_relations = relations(courses, ({ one, many }) => {
	return {
		category: one(categories, {
			fields: [courses.category_id],
			references: [categories.id],
		}),
		teacher: one(users, {
			fields: [courses.teacher_id],
			references: [users.id],
			relationName: 'teacher_courses',
		}),
		enrollments: many(enrollments),
	}
})

export default courses_relations

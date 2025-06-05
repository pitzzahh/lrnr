import { relations } from 'drizzle-orm'
import { courses, enrollments, users } from '..'

const enrollment_relations = relations(enrollments, ({ one }) => {
	return {
		user: one(users, {
			fields: [enrollments.user_id],
			references: [users.id],
		}),
		course: one(courses, {
			fields: [enrollments.course_id],
			references: [courses.id],
		}),
	}
})

export default enrollment_relations

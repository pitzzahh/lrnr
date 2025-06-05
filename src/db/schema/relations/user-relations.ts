import { relations } from 'drizzle-orm'
import { courses, enrollments, sessions, users } from '..'

const user_relations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions),
		enrollments: many(enrollments),
		courses: many(courses, {
			relationName: 'teacher_courses',
		}),
	}
})

export default user_relations

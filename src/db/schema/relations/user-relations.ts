import { relations } from 'drizzle-orm'
import { api_keys, courses, enrollments, sessions, users } from '..'

const user_relations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions),
		api_keys: many(api_keys),
		enrollments: many(enrollments),
		courses: many(courses, {
			relationName: 'teacher_courses',
		}),
	}
})

export default user_relations

import { courses, users } from '@/db/schema'
import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

const enrollments = pgTable('enrollments', (t) => ({
	user_id: t
		.uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	course_id: t
		.uuid()
		.notNull()
		.references(() => courses.id, { onDelete: 'cascade' }),
	enrolled_at: t
		.timestamp({
			withTimezone: true,
			mode: 'date',
		})
		.notNull(),
}))
export const SELECT_ENROLLMENTS_SCHEMA = createSelectSchema(enrollments)
export const INSERT_ENROLLMENTS_SCHEMA = createInsertSchema(enrollments, {
	user_id: (s) => s.user_id.min(1).max(500),
	course_id: (s) => s.course_id.min(1).max(500),
}).required({
	user_id: true,
	course_id: true,
	enrolled_at: true,
})
export const PATCH_ENROLLMENTS_SCHEMA = INSERT_ENROLLMENTS_SCHEMA.partial()
export type Enrollment = typeof enrollments.$inferSelect
export type EnrollmentWithCourse = Enrollment & {
	course: {
		id: string
		name: string
		description: string
		created_at: Date
		updated_at: Date
	}
	user: {
		id: string
		name: string
		email: string
		created_at: Date
		updated_at: Date
	}
}

export default enrollments

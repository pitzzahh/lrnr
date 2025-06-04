import { pgTable } from 'drizzle-orm/pg-core'
import { users } from '.'

const courses = pgTable('courses', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	title: t.text().notNull(),
	description: t.text(),
	created_by: t.uuid().references(() => users.id),
	created_at: t.timestamp().defaultNow(),
}))

export default courses

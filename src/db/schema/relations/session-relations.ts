import { relations } from 'drizzle-orm'
import { sessions, users } from '..'

const session_relations = relations(sessions, ({ one }) => {
	return {
		user: one(users, {
			fields: [sessions.user_id],
			references: [users.id],
		}),
	}
})

export default session_relations

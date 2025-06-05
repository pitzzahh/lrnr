import { relations } from 'drizzle-orm'
import { sessions, users } from '..'

const user_relations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions),
	}
})

export default user_relations

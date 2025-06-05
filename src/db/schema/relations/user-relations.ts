import { relations } from 'drizzle-orm'
import { users, sessions } from '..'

const user_relations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions),
	}
})

export default user_relations

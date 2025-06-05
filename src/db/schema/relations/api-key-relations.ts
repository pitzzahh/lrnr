import { relations } from 'drizzle-orm'
import api_keys from '../api-keys'
import users from '../users'

const api_key_relations = relations(api_keys, ({ one }) => ({
	user: one(users, {
		fields: [api_keys.user_id],
		references: [users.id],
	}),
}))

export default api_key_relations

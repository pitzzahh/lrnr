import { relations } from 'drizzle-orm'
import { categories, courses } from '..'

const categories_relations = relations(categories, ({ many }) => {
	return {
		sessions: many(courses),
	}
})

export default categories_relations

import { pgTable } from 'drizzle-orm/pg-core'

const categories = pgTable('categories', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull().unique(),
}))

export default categories

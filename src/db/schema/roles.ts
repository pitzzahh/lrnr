import { pgTable } from 'drizzle-orm/pg-core'
import roleName from '@/db/schema/enums/role-name'

const roles = pgTable('roles', (t) => ({
	id: t.text('id').primaryKey(),
	name: roleName(),
}))

export default roles

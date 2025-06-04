import roleName from '@/db/schema/enums/role-name'
import { pgTable } from 'drizzle-orm/pg-core'

const roles = pgTable('roles', (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: roleName(),
}))

export default roles

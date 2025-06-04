import { pgEnum } from 'drizzle-orm/pg-core'

const role_name = pgEnum('role_name', ['ADMIN', 'TEACHER', 'STUDENT'])

export default role_name

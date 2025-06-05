import { pgEnum } from 'drizzle-orm/pg-core'

const enrollment_status = pgEnum('enrollment_status', ['ACTIVE', 'COMPLETED', 'DROPPED', 'PENDING'])

export default enrollment_status

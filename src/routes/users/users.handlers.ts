import db from '@/db'
import { users } from '@/db/schema'
import type { AppRouteHandler } from '@/lib/types'
import { eq } from 'drizzle-orm'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from '@/lib/constants'
import type { ListRoute } from './users.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	return c.json(await db.query.users.findMany())
}

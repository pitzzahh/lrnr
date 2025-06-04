import db from '@/db'
import type { AppRouteHandler } from '@/lib/types'
import type { ListRoute, CreateRoute } from './users.routes'
import { users } from '@/db/schema'
import * as HttpStatusCodes from 'stoker/http-status-codes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	return c.json(await db.query.users.findMany())
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const user = c.req.valid('json')
	const [inserted_user] = await db.insert(users).values(user).returning()
	return c.json(inserted_user, HttpStatusCodes.OK)
}

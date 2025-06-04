import db from '@/db'
import type { AppRouteHandler } from '@/lib/types'
import type { ListRoute, CreateRoute, GetOneRoute } from './users.routes'
import { users } from '@/db/schema'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	return c.json(await db.query.users.findMany())
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const user = c.req.valid('json')
	const [inserted_user] = await db.insert(users).values(user).returning()
	return c.json(inserted_user, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const { id } = c.req.valid('param')
	const user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id)
		},
	})
	if (!user) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND
		)
	}
	return c.json(user, HttpStatusCodes.OK)
}

import db from '@/db'
import type { AppRouteHandler } from '@/lib/types'
import type { ListRoute } from './courses.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
	return c.json(await db.query.courses.findMany())
}

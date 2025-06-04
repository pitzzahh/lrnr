import { createRouter } from '@/lib/create-app'
import * as handlers from './courses.handlers'
import * as routes from './courses.routes'

const router = createRouter().openapi(routes.list, handlers.list)

export default router

import configureOpenAPI from '@/lib/configure-openapi'
import createApp from '@/lib/create-app'
import index from '@/routes/index.route'
import llms from '@/routes/llms/llms.route'
import users from '@/routes/users/users.index'
import categories from '@/routes/categories/categories.index'
import courses from '@/routes/courses/courses.index'
const app = createApp()

const routes = [index, llms, users, categories, courses]
await configureOpenAPI(app)
for (const route of routes) {
	app.route('/', route)
}

export type AppType = (typeof routes)[number]

export default app

import type { AppOpenAPI } from '@/lib/types'
import { Scalar } from '@scalar/hono-api-reference'
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'
import pj from '../../package.json'

const OPEN_API_VERSION = '3.1.0'
const OPEN_API_CONFIG = {
	openapi: OPEN_API_VERSION,
	info: {
		title: pj.name,
		description: pj.description,
		version: pj.version,
	},
}
export default async function configureOpenAPI(app: AppOpenAPI) {
	app.doc('/doc', OPEN_API_CONFIG)

	app.get(
		'/reference',
		Scalar({
			url: '/doc',
			theme: 'elysiajs',
			defaultHttpClient: {
				targetKey: 'js',
				clientKey: 'fetch',
			},
		})
	)

	app.get('/llms.md', async (c) => {
		const content = app.getOpenAPI31Document(OPEN_API_CONFIG)
		const markdown = await createMarkdownFromOpenApi(JSON.stringify(content))
		return c.text(markdown)
	})
}

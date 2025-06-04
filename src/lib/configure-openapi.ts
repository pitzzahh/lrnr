import type { AppOpenAPI } from '@/lib/types'
import { Scalar } from '@scalar/hono-api-reference'
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'
import pj from '../../package.json'

const OPEN_API_VERSION = '3.1.0'

export default async function configureOpenAPI(app: AppOpenAPI) {
	app.doc('/doc', {
		openapi: OPEN_API_VERSION,
		info: {
			title: pj.name,
			description: pj.description,
			version: pj.version,
		},
	})

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

	const content = app.getOpenAPI31Document({
		openapi: OPEN_API_VERSION,
		info: {
			title: pj.name,
			description: pj.description,
			version: pj.version,
		},
	})

	const markdown = await createMarkdownFromOpenApi(JSON.stringify(content))

	app.get('/llms.txt', async (c) => {
		return c.text(markdown)
	})
}

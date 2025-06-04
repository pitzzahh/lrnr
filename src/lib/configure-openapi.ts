import type { AppOpenAPI } from '@/lib/types'
import { Scalar } from '@scalar/hono-api-reference'
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'
import pj from '../../package.json'

export default async function configureOpenAPI(app: AppOpenAPI) {
	const content = app.getOpenAPI31Document({
		openapi: '3.1.0',
		info: { title: 'Example', version: 'v1' },
	})

	const markdown = await createMarkdownFromOpenApi(JSON.stringify(content))

	app.get('/llms.txt', async (c) => {
		return c.text(markdown)
	})

	app.doc('/doc', {
		openapi: '3.0.0',
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
}

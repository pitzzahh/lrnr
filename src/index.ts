import app from '@/app'
import env from '@/env'
import { serve } from 'bun'

const port = env.PORT
console.log(`Server is running on http://localhost:${port}`)

serve({
	fetch: app.fetch,
	port,
})

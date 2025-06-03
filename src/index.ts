import { OpenAPIHono } from '@hono/zod-openapi';
import { serve } from 'bun';

const app = new OpenAPIHono();

app.get("/", (c) => {
  return c.text("Hello, world!");
})

const port = process.env.PORT || 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
})
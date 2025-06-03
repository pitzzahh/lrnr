import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError } from 'stoker/middlewares';
import { logger } from '@/pino-logger';

const app = new OpenAPIHono();
app.use(logger());

app.get("/", (c) => {
  return c.text("Hello, world!");
})

app.get("/health", (c) => {
  throw new Error("This is a test error");
});

app.notFound(notFound);
app.onError(onError);

export default app;
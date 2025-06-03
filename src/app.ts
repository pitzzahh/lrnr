import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { logger } from '@/hooks/pino-logger';
import { AppBindings } from '@/types/app-bindings';

const app = new OpenAPIHono<AppBindings>();
app.use(logger());
app.use(serveEmojiFavicon("📑"))

app.get("/", (c) => {
  c.var.logger.info("Root endpoint accessed");
  return c.text("Hello, world!");
})

app.get("/health", (c) => {
  throw new Error("This is a test error");
});

app.notFound(notFound);
app.onError(onError);

export default app;
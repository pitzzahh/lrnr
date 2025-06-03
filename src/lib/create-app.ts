import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { logger } from '@/hooks/pino-logger';
import { AppBindings } from '@/types/app-bindings';

export default function createApp() {
  const app = new OpenAPIHono<AppBindings>();
  app.use(logger());
  app.use(serveEmojiFavicon("📑"))

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
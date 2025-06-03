import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { logger } from '@/hooks/pino-logger';
import { AppBindings } from '@/lib/types/app';

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false });
}

export default function createApp() {
  const app = createRouter();
  app.use(logger());
  app.use(serveEmojiFavicon("📑"))

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
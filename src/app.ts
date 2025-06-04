import createApp from '@/lib/create-app';
import configureOpenAPI from '@/lib/configure-openapi';
import index from '@/routes/index.route';
import llms from '@/routes/llms/llms.route';
const app = createApp();

const routes = [
  index, llms
]
// @ts-ignore
await configureOpenAPI(app);
routes.forEach(route => (app.route("/", route)));

export default app;
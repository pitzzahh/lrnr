import createApp from '@/lib/create-app';
import configureOpenAPI from '@/lib/configure-openapi';
import index from '@/routes/index.route';
const app = createApp();

const routes = [
  index
]

configureOpenAPI(app);
routes.forEach(route => (app.route("/", route)));

export default app;
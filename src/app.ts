import createApp from '@/lib/create-app';
import configureOpenAPI from '@/lib/configure-openapi';

const app = createApp();

configureOpenAPI(app);

export default app;
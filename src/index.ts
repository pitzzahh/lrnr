import { serve } from 'bun';
import app from '@/app';
import env from '@/env';

const port = env.PORT;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
})
import { serve } from 'bun';
import app from '@/app';

const port = process.env.PORT || 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
})
import createApp from '@/lib/create-app';

const app = createApp();

app.get("/", (c) => {
  c.var.logger.info("Root endpoint accessed");
  return c.text("Hello, world!");
})

app.get("/health", (c) => {
  throw new Error("This is a test error");
});

export default app;
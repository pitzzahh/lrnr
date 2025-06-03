import { createRouter } from "@/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";

const router = createRouter()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Root"],
      responses: {
        200: {
          description: "lrnr API",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string().describe("lrnr API index route"),
              }),
            }
          }
        }
      }
    }),
    (c) => {
      return c.json({ message: "lrnr API" });
    }
  );

export default router;
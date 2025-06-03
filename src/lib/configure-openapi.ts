import type { AppOpenAPI } from "@/lib/types/app";
import pj from "../../package.json"
import { Scalar } from "@scalar/hono-api-reference";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: pj.name,
      description: pj.description,
      version: pj.version
    },
  });
  app.get("/reference", Scalar({ url: '/doc' }))
}
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { HTTPException } from 'hono/http-exception';

import { HonoVariables } from '@server/types';
import { serverLogger } from '@server/lib/configs/logger';
import api from './api';
import { loggingMiddleware } from './middleware/logging';

const app = new Hono<{ Variables: HonoVariables }>()
  .onError((err, c) => {
    console.log("Error Details\n", err);
    serverLogger.error("Error Details\n", {
      error: err,
      url: c.req.url,
      method: c.req.method,
      headers: c.req.raw.headers,
    });

    // TODO: Insert error into db
    // TODO: Send email to admin

    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    return c.json({ message: "Internal Server Error" }, 500);
  })
  .use("*", loggingMiddleware)
  .route("/api", api)
  .get("*", serveStatic({ root: "./client/dist" }))
  .get("*", serveStatic({ root: "./client/dist/index.html" }));

export default app

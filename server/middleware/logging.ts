import { HonoVariables } from "@server/types";
import { createFactory } from "hono/factory";
import { serverLogger } from "@server/lib/configs/logger";

const loggerFactory = createFactory<{ Variables: HonoVariables }>();

export const loggingMiddleware = loggerFactory.createMiddleware(async function (
  ctx,
  next
) {
  const start = Date.now();

  serverLogger.info("Incoming request to API", {
    req: {
      method: ctx.req.method,
      url: ctx.req.url,
      headers: {
        "user-agent": ctx.req.header("User-Agent"),
        "accept-language": ctx.req.header("Accept-Language"),
      },
    },
  });

  await next();

  serverLogger.info("Outgoing response", {
    req: { method: ctx.req.method, url: ctx.req.url }, // Keep request context
    res: { status: ctx.res.status },
    duration: Date.now() - start,
  });
});

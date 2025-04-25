import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "@server/auth";

import { HonoVariables } from "@server/types";
import { serverLogger } from "@server/lib/configs/logger";

const authFactory = createFactory<{ Variables: HonoVariables }>();

/**
 * Checks if there is a session and attaches the data to the request.
 * Useful for requests that don't require authentication, but could use the session data if it exists to alter the response.
 *
 * ex: if a user tries to sign in but is already authenticated, we can use this middleware to attach the session data to the request.
 */
export const checkSession = authFactory.createMiddleware(async (c, next) => {
  serverLogger.info("Checking session");

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);

    serverLogger.info("No session found");

    return next();
  }

  serverLogger.info("Session found", {
    session,
  });

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});

/**
 * Checks if there is a user and session and attaches the data to the request.
 * Ends requests that don't have a user and session.
 */
export const authorizeRequest = authFactory.createMiddleware(
  async (c, next) => {
    serverLogger.info("Authorizing request");

    const url = new URL(c.req.url);
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) {
      serverLogger.error("Request unauthorized");

      throw new HTTPException(401, {
        message: "Unauthorized",
        cause: new Error("Unauthorized"),
        res: c.newResponse(null, 401),
      });
    }

    serverLogger.info("Request authorized", {
      userId: user.id,
      email: user.email,
    });

    return next();
  }
);

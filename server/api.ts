// Core packages
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { StatusCode } from "hono/utils/http-status";

// Routes
import userRouter from "@server/routes/user.routes";
import videoRouter from "@server/routes/video.routes";
import queuesRouter from "@server/routes/queues.routes";
import feedbackRouter from "@server/routes/feedback.routes";
import onboardingRouter from "@server/routes/onboarding.routes";
import videoAssetsRouter from "@server/routes/video_assets.routes";
// Api Utils
import { auth } from "@server/auth";
import { checkSession } from "@server/middleware/auth";
import { HonoVariables } from "@server/types";
import { serverLogger } from "@server/lib/configs/logger";

const api = new Hono<{ Variables: HonoVariables }>()
  .use(
    "/auth/*",
    cors({
      origin: ["https://rollup-ai.dev", "https://rollup-ai.fly.dev", "http://localhost:3000", "http://localhost:5173"],
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .onError(async (err, c) => {
    serverLogger.error('Central Error Handler:', err);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (err instanceof HTTPException) {
      statusCode = err.status;
      const resp = err.getResponse();
      try {
        const body = await resp.json();
        errorMessage = body.message || resp.statusText || errorMessage;
      } catch {
        errorMessage = resp.statusText || errorMessage;
      }
    }

    // Add checks for other specific error types if needed
    // else if (err instanceof MyCustomValidationError) {
    //   statusCode = 400;
    //   errorMessage = 'Validation Failed';
    //   // Potentially format validation errors
    // }
    // else if (err instanceof SomeDatabaseError) {
    //   statusCode = 503; // Service Unavailable
    //   errorMessage = 'Database operation failed';
    //   // Don't leak DB details to the client!
    // }

    c.status(statusCode as StatusCode);
    return c.json({
      success: false,
      error: {
        message: errorMessage,
      },
    });
  })
  .use("*", checkSession)
  .on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })
  .route("/queues", queuesRouter)
  .route("/feedback", feedbackRouter)
  .route("/onboarding", onboardingRouter)
  .route("/users", userRouter)
  .route("/videos", videoRouter)
  .route("/video_assets", videoAssetsRouter);

export default api;

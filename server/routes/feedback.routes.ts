// Core Packages
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

// Middleware
import { authorizeRequest } from "@server/middleware/auth";

// Schemas
import { insertFeedbackSubmissionSchema } from "@server/db/models";

// Lib
import { HonoUser, HonoVariables } from "@server/types";

// Services
import { submitFeedback } from "@server/services/db/feedback.services";

const submitFeedbackJsonSchema = insertFeedbackSubmissionSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export default new Hono<{ Variables: HonoVariables }>()
  .post(
    "/",
    authorizeRequest,
    zValidator("json", submitFeedbackJsonSchema),
    async function (c) {
      const user = c.get("user") as HonoUser;

      const validatedFeedbackData = c.req.valid("json");

      await submitFeedback({
        ...validatedFeedbackData,
        userId: user.id,
      }).catch((err) => {
        throw new HTTPException(500, {
          message: "Unable to submit feedback. Please try again later.",
          cause: err,
          res: c.res,
        });
      });

      return c.json({
        message: "Feedback submitted successfully",
        data: {
          success: true,
        },
      });
    }
  );


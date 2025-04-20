// Core Packages
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

// Middleware
import { authorizeRequest } from "@server/middleware/auth";

// Lib
import { HonoUser, HonoVariables } from "@server/types";

// Schemas
import { insertOnboardingSurveySchema } from "@server/db/models";

// Services
import { updateUserTour } from "@server/services/db/user.services";
import { verifyOnboardingSurvey } from "@server/services/db/onboarding_survey.services";
import { insertOnboardingSurveyAnswers, skipOnboardingSurvey } from "@server/services/db/onboarding_survey.services";

const submitOnboardingSurveyJsonSchema = insertOnboardingSurveySchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .transform((val) => ({
    ...val,
    referralSource:
      val.referralSource !== null && val.referralSource !== undefined
        ? (val.referralSource.toString() as unknown as typeof val.referralSource)
        : null,
  }));

export default new Hono<{ Variables: HonoVariables }>()
  .get(
    "/survey",
    authorizeRequest,
    async function (c) {
      const user = c.get("user") as HonoUser;

      const surveyAnswers = await verifyOnboardingSurvey(user.id)
        .then(data => {
          return data;
        })
        .catch(err => {
          throw new HTTPException(500, {
            message: "Internal server error",
            cause: err,
            res: c.res,
          });
        });

      return c.json({
        message: "Survey submitted successfully",
        data: {
          hasSubmitted: surveyAnswers.success,
        },
      });
    }
  )
  .post(
    "/survey",
    authorizeRequest,
    zValidator("json", submitOnboardingSurveyJsonSchema),
    async (c) => {
      const user = c.get("user") as HonoUser;
      const surveyAnswers = c.req.valid("json");

      const submissionResponse = await insertOnboardingSurveyAnswers(user.id, surveyAnswers)
        .then(data => {
          return data;
        })
        .catch(err => {
          throw new HTTPException(500, {
            message: "Internal server error",
            cause: err,
            res: c.res,
          });
        });

      return c.json({
        message: "Survey submitted successfully",
        data: {
          success: submissionResponse.success,
        },
      });
    }
  )
  .put(
    "/survey",
    authorizeRequest,
    async (c) => {
      const user = c.get("user") as HonoUser;

      const response = await skipOnboardingSurvey(user.id)
        .then(data => {
          return data;
        })
        .catch(err => {
          throw new HTTPException(500, {
            message: "Internal server error",
            cause: err,
            res: c.res,
          });
        });

      return c.json({
        message: "Onboarding survey skipped successfully",
        data: {
          success: response.success,
        },
      });
    })
  .put("/tour", authorizeRequest, async (c) => {
    const user = c.get("user") as HonoUser;

    await updateUserTour(user.id)
      .then(data => {
        return data;
      })
      .catch(err => {
        throw new HTTPException(500, {
          message: "Internal server error",
          cause: err,
          res: c.res,
        });
      });

    return c.json({
      message: "Tour updated successfully",
      data: {
        success: true,
      },
    });
  });

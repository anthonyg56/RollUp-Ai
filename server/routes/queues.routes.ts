import { Hono } from "hono";
import { HonoUser, HonoVariables } from "@server/types";
import { authorizeRequest } from "@server/middleware/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import createVideoProcessingFlow from "@server/queues/flows/video-processing.flow";
import { HTTPException } from "hono/http-exception";

const initalizeVideoProcessingJsonSchema = z.object({
  videoSubmissionId: z.string(),
  generateCaptions: z.boolean().optional().default(true),
  generateBroll: z.boolean().optional().default(true),
})

export default new Hono<{ Variables: HonoVariables }>()
  .post(
    '/video/start',
    authorizeRequest,
    zValidator('json', initalizeVideoProcessingJsonSchema),
    async (c) => {
      const user = c.get("user") as HonoUser;
      const submissionInfo = c.req.valid("json");

      const jobId = await createVideoProcessingFlow({
        userId: user.id,
        submissionInfo,
      })
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
        message: "Jobs fetched successfully",
        data: {
          jobId,
        },
      });
    })
  .get('/video/progress/:jobId', authorizeRequest, async (c) => {
    const user = c.get("user") as HonoUser;

    return c.json({
      message: "Jobs fetched successfully",
    });
  });

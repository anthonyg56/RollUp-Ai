import { Hono } from "hono";
import { HonoUser, HonoVariables } from "@server/types";
import { authorizeRequest } from "@server/middleware/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import createVideoProcessingFlow from "@server/queues/flows/process-new-video.flow";
import { HTTPException } from "hono/http-exception";
import { PROCESS_VIDEO_QUEUE } from "@server/queues/queue-names";
import { VideoProgressAsset } from "@server/services/db/assets.services";
import { insertJob } from "@server/services/db/video_processing_jobs.service";
import db from "@server/db";
import { videoProcessingJobs, videoSubmissions } from "@server/db/models";
import { eq } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { users } from "@server/db/models";
import { videoAssets } from "@server/db/models/video_assets";
import { serverLogger } from "@server/lib/configs/logger";
import { qeStreamSSE } from "@server/queues/listeners/utils";

const initalizeVideoProcessingJsonSchema = z.object({
  id: z.string(),
  generateCaptions: z.boolean().optional().default(true),
  generateBroll: z.boolean().optional().default(true),
})

export default new Hono<{ Variables: HonoVariables }>()
  .post(
    '/process-video/:assetId/start',
    authorizeRequest,
    zValidator('json', initalizeVideoProcessingJsonSchema),
    async (c) => {
      const user = c.get("user") as HonoUser;
      const submissionData = c.req.valid("json");

      const jobId = await createVideoProcessingFlow({
        userId: user.id,
        submissionData,
      })
        .then(async data => {
          if (!data) {
            throw new HTTPException(500, {
              message: "Internal server error",
              cause: new Error("No data returned from createVideoProcessingFlow"),
              res: c.res,
            });
          };

          const job = await insertJob({
            jobId: data,
            videoSubmissionId: submissionData.id,
          });

          return job;
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
  .get(
    '/process-video/:assetId/progress',
    authorizeRequest,
    zValidator('param', z.object({
      assetId: z.string(),
      flowJobId: z.string(),
    })),
    async (c) => {
      const user = c.get("user") as HonoUser;
      const assetId = c.req.param('assetId');
      const flowJobId = c.req.param('flowJobId');

      if (!assetId) {
        return c.text('Missing Asset ID', 400);
      }

      let asset: VideoProgressAsset | null = null;

      try {
        asset = await db
          .select({
            ...getTableColumns(videoAssets),
            userId: users.id,
            jobId: videoProcessingJobs.jobId,
          })
          .from(videoAssets)
          .innerJoin(videoSubmissions, eq(videoAssets.videoSubmissionId, videoSubmissions.id))
          .innerJoin(users, eq(videoSubmissions.userId, users.id))
          .innerJoin(videoProcessingJobs, eq(videoAssets.id, videoProcessingJobs.videoSubmissionId))
          .where(eq(videoAssets.id, assetId))
          .limit(1)
          .then(result => result[0]);
      } catch (error: unknown) {
        serverLogger.error(`Error fetching asset by ID: ${assetId}`, {
          error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new HTTPException(500, {
          message: "Internal server error",
          cause: error,
          res: c.res,
        });
      }

      if (!asset) {
        throw new HTTPException(404, {
          message: "Asset not found",
          res: c.res,
        });
      } else if (asset.userId !== user.id) {
        throw new HTTPException(403, {
          message: "Unauthorized",
          res: c.res,
        });
      } else if (asset.jobId !== flowJobId) {
        throw new HTTPException(403, {
          message: "Invalid Job",
          res: c.res,
        });
      };

      serverLogger.info(`SSE connection opening for Asset ID: ${assetId}`);

      return qeStreamSSE(c, {
        jobId: asset.jobId,
        flowJobId,
        queueName: PROCESS_VIDEO_QUEUE,
      });
    });

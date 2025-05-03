// Core Packages
import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

// Middleware
import { authorizeRequest } from "@server/middleware/auth";

// Schemas
import { insertVideoSubmissionSchema, videoAssets, videoSubmissions } from "@server/db/models";

// Lib
import { HonoUser, HonoVariables } from "@server/types";
import { uuidSchema, videoFileSchema } from "@server/lib/schemas";

// Services
import { generateObjectKey } from "@server/services/r2";
import { insertAsset } from "@server/services/db/assets.services";
import { insertNewVideoSubmission } from "@server/services/db/video_submission.services";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@server/lib/configs/s3-client";
import { HTTPException } from "hono/http-exception";
import { serverLogger } from "@server/lib/configs/logger";
import db from "@server/db";
import { eq, getTableColumns } from "drizzle-orm";

export default new Hono<{ Variables: HonoVariables }>()
  .post(
    "/",
    authorizeRequest,
    zValidator("json", z.object({
      videoFile: videoFileSchema,
      submissionData: insertVideoSubmissionSchema.omit({
        category: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      }),
    })),
    async function (c) {
      const user = c.get("user") as HonoUser;
      const { videoFile, submissionData } = c.req.valid("json");

      const r2Key = generateObjectKey(videoFile.name);

      const [{ ETag: r2ETag }, { id: videoSubmissionId }] = await Promise.all([
        await s3Client.send(
          new PutObjectCommand({
            Bucket: "original_videos",
            Key: r2Key,
            Body: videoFile,
            ContentType: videoFile.type,
          })),
        insertNewVideoSubmission({
          ...submissionData,
          userId: user.id,
        }),
      ]);

      if (!r2ETag) {
        throw new HTTPException(500, {
          message: "Failed to upload video to R2",
        });
      }

      // Combine R2 data & video submission id in db to save as an asset
      const { id: videoAssetId } = await insertAsset({
        r2Key,
        r2ETag,
        userId: user.id,
        videoSubmissionId,
        assetType: "original_video",
      });

      return c.json({
        message: "Video uploaded successfully",
        data: {
          r2Key,
          r2ETag,
          videoAssetId,
          videoSubmissionId,
        },
      });
    }
  )
  .get(
    "/submission/:id",
    authorizeRequest,
    zValidator("param",
      z.object({
        id: uuidSchema,
      }),
    ),
    async function (c) {
      const { id } = c.req.valid("param");

      const videoSubmission = await db
        .select({
          ...getTableColumns(videoSubmissions),
          assetId: videoAssets.id,
        })
        .from(videoSubmissions)
        .innerJoin(videoAssets, eq(videoSubmissions.id, videoAssets.videoSubmissionId))
        .where(eq(videoSubmissions.id, id))
        .limit(1)
        .then(result => result[0])
        .catch(err => {
          serverLogger.error(`Error fetching video asset by ID: ${id}`, {
            error: err,
            stack: err instanceof Error ? err.stack : undefined,
          });

          throw new HTTPException(500, {
            message: "Failed to fetch video asset",
            cause: err,
          });
        });

      return c.json({
        message: "Video asset fetched successfully",
        data: {
          videoSubmission,
        },
      });
    }
  )


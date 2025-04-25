// Core Packages
import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

// Middleware
import { authorizeRequest } from "@server/middleware/auth";

// Schemas
import { insertVideoSubmissionSchema } from "@server/db/models";

// Lib
import { HonoUser, HonoVariables } from "@server/types";
import { videoFileSchema } from "@server/lib/schemas";

// Services
import { generateObjectKey } from "@server/services/r2";
import { insertAsset } from "@server/services/db/assets.services";
import { insertNewVideoSubmission } from "@server/services/db/video_submission.services";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@server/lib/configs/s3-client";
import { HTTPException } from "hono/http-exception";
import { serverLogger } from "@server/lib/configs/logger";

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
        assetType: "original_videos",
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
  );

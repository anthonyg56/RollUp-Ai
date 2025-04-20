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
import { putVideoAsset } from "@server/services/r2";
import { insertNewVideoAsset } from "@server/services/db/assets.services";
import { insertNewVideoSubmission } from "@server/services/db/video_submission.services";

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

      const [{ eTag: r2ETag, key: r2Key }, { id: videoSubmissionId }] = await Promise.all([
        putVideoAsset(videoFile, "original_videos"),
        insertNewVideoSubmission({
          ...submissionData,
          userId: user.id,
        }),
      ]);

      // Combine R2 data & video submission id in db to save as an asset
      const { id: videoAssetId } = await insertNewVideoAsset({
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
  );

import db from "@server/db";
import { videoProcessingJobs, videoSubmissions } from "@server/db/models";
import { users } from "@server/db/models/users";
import { VideoAsset, videoAssets } from "@server/db/models/video_assets";
import { AssetType } from "@server/lib/constants";
import { eq, getTableColumns } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

// Custom Query Types
export interface VideoProgressAsset extends VideoAsset {
  userId: typeof users.$inferSelect.id;
  jobId: typeof videoProcessingJobs.$inferSelect.jobId;
};

// Functions
export async function insertAsset(data: {
  userId: string;
  assetType: AssetType;
  r2ETag: string;
  r2Key: string;
  videoSubmissionId: string;
}) {
  const asset = await db
    .insert(videoAssets)
    .values(data)
    .returning({
      id: videoAssets.id,
    });

  return asset[0];
}

export async function getAssetById(id: string) {
  const asset = await db
    .select()
    .from(videoAssets)
    .where(eq(videoAssets.id, id))
    .limit(1);

  if (asset.length === 0) {
    throw new HTTPException(404, {
      message: 'Asset not found',
    });
  }

  return asset[0];
}

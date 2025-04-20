import db from "@server/db";
import { videoAssets } from "@server/db/models/video_assets";
import { R2Bucket, VideoAssetType } from "@server/lib/constants";
import { eq } from "drizzle-orm";
import { putVideoAsset } from "../r2";
import { unlink } from "node:fs/promises";
import { HTTPException } from "hono/http-exception";

export async function insertNewVideoAsset(data: {
  userId: string;
  assetType: VideoAssetType;
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

export async function getVideoAssetById(id: string) {
  try {
    const asset = await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.id, id))
      .limit(1);

    if (asset.length === 0) {
      throw new HTTPException(404, {
        message: 'Video asset not found',
      });
    }

    return asset[0];
  } catch (error) {
    throw new HTTPException(500, {
      message: 'Failed to get video asset',
      cause: error,
    });
  }
}

interface UploadAssetOptions {
  path: string;
  userId: string;
  videoSubmissionId: string;
  bucketName: R2Bucket;
  unlinkPath?: boolean;
}

/**
 * Uploads a video asset to R2 and The Database
 */
export async function uploadAsset({
  path,
  userId,
  videoSubmissionId,
  bucketName,
  unlinkPath = true,
}: UploadAssetOptions) {
  const file = Bun.file(path);

  const { eTag, key } = await putVideoAsset(file, bucketName);

  const { id: assetId } = await insertNewVideoAsset({
    userId,
    assetType: "captioned_video",
    r2ETag: eTag as string,
    r2Key: key,
    videoSubmissionId,
  });

  if (unlinkPath) {
    await unlink(path).catch(() => { });
  }

  return {
    id: assetId,
    r2Key: key,
    r2ETag: eTag,
  };
}
import db from "@server/db";
import { videoProcessingJobs, videoSubmissions } from "@server/db/models";
import { users } from "@server/db/models/users";
import { VideoAsset, videoAssets } from "@server/db/models/video_assets";
import { ASSET_BUCKETS, AssetBucket, AssetType } from "@server/lib/constants";
import { and, eq } from "drizzle-orm";
import { AssetsRepository } from "../assetRepository.service";
import { basename } from "path";
import { uploadThumbnail } from "@server/services/db/video_thumbnail.services";
import { uploadR2Obj } from "../r2";

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

export async function getAssetBySubmissionId(
  submissionId: string,
  assetType: AssetType = "original_video"
): Promise<VideoAsset | null> {
  const asset = await db
    .select()
    .from(videoAssets)
    .where(
      and(
        eq(videoAssets.videoSubmissionId, submissionId),
        eq(videoAssets.assetType, assetType)
      )
    )
    .limit(1);

  if (asset.length === 0) {
    return null;
  }

  return asset[0];
}

export async function getAssetById(id: string): Promise<VideoAsset | null> {
  const asset = await db
    .select()
    .from(videoAssets)
    .where(eq(videoAssets.id, id))
    .limit(1);

  if (asset.length === 0) {
    return null;
  }

  return asset[0];
}

export async function saveQueueAsset(
  userId: string,
  assetRepository: AssetsRepository,
  assetType: AssetType,
  submissionId: string,
) {
  const [asset, originalVideo] = await Promise.all([
    checkForAsset(assetRepository, assetType),
    checkForAsset(assetRepository, 'original_video'),
  ]);

  if (!asset || !originalVideo || !asset.path || !originalVideo.assetId) {
    throw new Error(`Asset ${assetType} not found`);
  }

  await handleAssetUpload(assetType, {
    userId,
    path: asset.path,
    originalVideoAssetId: originalVideo.assetId,
    videoSubmissionId: submissionId,
  });
};


async function checkForAsset(assetRepository: AssetsRepository, assetType: AssetType) {
  const asset = assetRepository.getAsset(assetType);

  if (!asset || !asset.path || !asset.assetId) {
    let message: string;

    switch (assetType) {
      case 'original_video':
        message = 'Original video asset not found';
        break;
      case 'generated_video':
        message = 'Generated video asset not found';
        break;
      case 'thumbnail':
        message = 'Thumbnail asset not found';
        break;
      case 'srt_transcript':
        message = 'SRT transcript asset not found';
        break;
      case 'plain_transcript':
        message = 'Plain transcript asset not found';
        break;
      case 'audio':
        message = 'Audio asset not found';
        break;
      case 'keyword_extraction':
        message = 'Keyword extraction asset not found';
        break;
      default:
        message = 'Asset not found';
        break;
    }

    throw new Error(`Asset ${assetType} not found: ${message}`);
  }

  return asset;
}

async function handleAssetUpload(
  assetType: AssetType,
  data: {
    userId: string;
    path: string;
    originalVideoAssetId: string;
    videoSubmissionId: string;
  }
) {
  let filename: string;
  const isR2Obj = ASSET_BUCKETS.includes(assetType as AssetBucket);

  if (assetType === 'thumbnail') {
    await uploadThumbnail(data.path, data.originalVideoAssetId);
  } else if (isR2Obj) {
    filename = basename(data.path);

    if (!filename || !filename.includes('.')) {
      throw new Error(`Asset type ${assetType} not found`);
    }

    const { key: r2Key, eTag: r2ETag } = await uploadR2Obj(data.path, data.path, assetType as AssetBucket);

    const dbAsset = await insertAsset({
      userId: data.userId,
      assetType,
      r2ETag,
      r2Key,
      videoSubmissionId: data.videoSubmissionId,
    });

    return dbAsset.id;
  } else {
    throw new Error(`Asset type ${assetType} not found`);
  }
}
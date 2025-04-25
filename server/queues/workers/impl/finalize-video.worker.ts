// server/queues/workers/impl/finalize-video.worker.ts

import { Worker } from "bullmq";
import redisConnection from "@server/queues/redis-connection";
import { ProcessNewVideoData } from "@server/queues/types";
import { AssetsRepository } from "@server/services/db/AssetRepository.service";
import { AssetBucket, AssetType, ASSET_BUCKETS } from "@server/lib/constants";
import { uploadR2Obj } from "@server/services/r2";
import { insertAsset } from "@server/services/db/assets.services";
import { uploadThumnail } from "@server/services/db/video_thumbnail.services"; // Handles Cloudflare upload + DB
import { serverLogger } from "@server/lib/configs/logger";
import { FinalizeVideoError } from "@server/queues/errors";
import RootFileService from "@server/services/FileIO.service";
import { basename } from "node:path";
import { PROCESS_VIDEO_QUEUE } from "@server/queues/queue-names";

async function saveAsset(
  assetType: AssetType,
  assetPath: string,
  assetRepository: AssetsRepository,
  userId: string,
  videoSubmissionId: string
): Promise<void> {
  const absoluteFilePath = assetRepository.getAssetKeyByPath(assetPath);
  const fileName = basename(absoluteFilePath); // Extract filename

  serverLogger.info(`Processing asset: ${assetType}, Path: ${absoluteFilePath}`);

  try {
    if (assetType === "thumbnail") {
      // Thumbnails go to Cloudflare Images and get a DB entry via uploadThumnail
      const originalAsset = assetRepository.getAsset("original_videos"); // Need original asset ID for linking
      if (!originalAsset?.assetId) {
        throw new Error("Original video asset ID not found for thumbnail association.");
      }
      const thumbnailDbId = await uploadThumnail(absoluteFilePath, originalAsset.assetId);
      serverLogger.info(`Uploaded thumbnail to Cloudflare Images and DB. DB ID: ${thumbnailDbId}`);
      // No need to delete the local file yet, repository cleanup handles it.
    } else if (ASSET_BUCKETS.includes(assetType as AssetBucket)) {
      // Assets with defined buckets go to R2 and get a DB entry
      const bucket = assetType as AssetBucket;
      const { key: r2Key, eTag: r2ETag } = await uploadR2Obj(absoluteFilePath, fileName, bucket);
      const dbAsset = await insertAsset({
        userId,
        assetType,
        r2ETag,
        r2Key,
        videoSubmissionId,
      });
      assetRepository.addAssetId(assetType, dbAsset.id); // Store the DB ID back if needed later
      assetRepository.addAssetETag(assetType, r2ETag);   // Store the ETag back if needed later
      serverLogger.info(`Uploaded ${assetType} to R2 (Key: ${r2Key}) and DB (ID: ${dbAsset.id})`);
      // No need to delete the local file yet.
    } else {
      // Assets without a bucket (intermediate files) are just logged for now.
      // They will be deleted during repository cleanup.
      serverLogger.info(`Asset type '${assetType}' is intermediate or has no defined bucket. Skipping explicit upload/DB insert. It will be cleaned up.`);
    }
  } catch (error) {
    serverLogger.error(`Failed to process asset ${assetType} at path ${absoluteFilePath}:`, error);
    // Decide if this error should fail the whole job or just log and continue
    // For now, let's rethrow to fail the job if any critical asset fails
    if (ASSET_BUCKETS.includes(assetType as AssetBucket) || assetType === "thumbnail") {
      throw new Error(`Critical asset processing failed for ${assetType}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

const finalizeVideoWorker = new Worker<ProcessNewVideoData>(
  PROCESS_VIDEO_QUEUE,
  async (job) => {
    const { assetRepository, userId, submissionData } = job.data;
    const repositoryPath = assetRepository.Path; // Get the relative path stored in the repository instance
    serverLogger.info(`Starting finalize-video job for submission: ${submissionData.id}, Repository: ${repositoryPath}`);

    const processingErrors: string[] = [];

    try {
      // Process all assets in the repository
      const assetEntries = Object.entries(assetRepository.assets);
      for (const [assetType, assetData] of assetEntries) {
        if (assetData?.path) {
          try {
            await saveAsset(
              assetType as AssetType,
              assetData.path, // Pass the relative path within the repo
              assetRepository,
              userId,
              submissionData.id
            );
          } catch (error) {
            processingErrors.push(`Failed to save asset ${assetType}: ${error instanceof Error ? error.message : String(error)}`);
            serverLogger.error(`Error during asset saving loop for ${assetType}:`, error)
          }
        } else {
          serverLogger.warn(`Asset data or path missing for asset type: ${assetType}`);
        }
      }

      // If any errors occurred during asset processing, throw an aggregate error
      if (processingErrors.length > 0) {
        throw new Error(`Errors occurred during asset finalization: ${processingErrors.join('; ')}`);
      }

      serverLogger.info(`All assets processed for submission: ${submissionData.id}`);

    } catch (error) {
      serverLogger.error(`Error in finalize-video worker for submission ${submissionData.id}:`, error);
      // Ensure repository cleanup happens even on error, then rethrow
      try {
        serverLogger.warn(`Attempting repository cleanup due to error for submission: ${submissionData.id}, Path: ${repositoryPath}`);
        await RootFileService.deleteRepository(repositoryPath);
        serverLogger.info(`Repository cleaned up after error for submission: ${submissionData.id}`);
      } catch (cleanupError) {
        serverLogger.error(`CRITICAL: Failed to cleanup repository ${repositoryPath} after job error:`, cleanupError);
      }
      // Rethrow the original error to fail the BullMQ job
      throw new FinalizeVideoError(
        `Failed to finalize video processing for submission ${submissionData.id}: ${error instanceof Error ? error.message : String(error)}`,
        { // Assuming FinalizeVideoError takes data like this
          queueDir: repositoryPath,
          videoAssetId: assetRepository.getAsset('original_videos')?.assetId || 'unknown'
        }
      );
    }

    // Cleanup the entire repository directory on successful completion
    try {
      serverLogger.info(`Attempting final repository cleanup for submission: ${submissionData.id}, Path: ${repositoryPath}`);
      await RootFileService.deleteRepository(repositoryPath);
      serverLogger.info(`Repository successfully cleaned up for submission: ${submissionData.id}`);
    } catch (cleanupError) {
      serverLogger.error(`Error during final repository cleanup for ${repositoryPath}:`, cleanupError);
      // Consider if this failure should fail the job even if assets were processed.
      // Maybe log as critical but don't throw, as assets might be saved.
      throw new FinalizeVideoError( // Or maybe a different error type
        `Asset processing completed, but failed to cleanup repository ${repositoryPath}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
        {
          queueDir: repositoryPath,
          videoAssetId: assetRepository.getAsset('original_videos')?.assetId || 'unknown'
        }
      );
    }

    serverLogger.info(`Successfully completed finalize-video job for submission: ${submissionData.id}`);
    return { success: true, message: "Video finalized and repository cleaned." }; // Indicate successful completion
  },
  {
    connection: redisConnection,
    autorun: false, // Assuming you run workers separately
  }
);

export default finalizeVideoWorker;
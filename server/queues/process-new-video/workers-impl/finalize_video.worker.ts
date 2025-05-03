import { Job } from "bullmq";
import { ProcessNewVideoData } from "@server/queues/process-new-video/types";
import { AssetType, } from "@server/lib/constants";
import { saveQueueAsset } from "@server/services/db/assets.services";
import { serverLogger } from "@server/lib/configs/logger";
import RootFileService from "@server/services/FileIO.service";
import { RollupQueueErrorData, RollupQueueError } from "@server/queues/process-new-video/types";
import { FINALIZE_VIDEO_QUEUE } from "@server/queues/process-new-video/queue-names";

export class FinalizeVideoError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, FINALIZE_VIDEO_QUEUE, data);
    this.name = 'FinalizeVideoError';
  }
}

export async function finalizeVideoWorker(job: Job<ProcessNewVideoData>) {
  const { assetRepository, userId, submissionData } = job.data;
  const repositoryPath = assetRepository.Path;

  serverLogger.info(`Starting finalize-video job for submission: ${submissionData.id}, Repository: ${repositoryPath}`);

  const processingErrors: string[] = [];
  const assetEntries = Object.entries(assetRepository.assets);

  for (const [assetType, assetData] of assetEntries) {
    if (assetData?.path) {
      await saveQueueAsset(
        userId,
        assetRepository,
        assetType as AssetType,
        submissionData.id
      );
    } else {
      serverLogger.warn(`Asset data or path missing for asset type: ${assetType}`);
    }
  }

  if (processingErrors.length > 0) {
    throw new FinalizeVideoError(`Errors occurred during asset finalization: ${processingErrors.join('; ')}`, {
      queueDir: repositoryPath,
      videoAssetId: assetRepository.getAsset('original_video')?.assetId || 'unknown'
    });
  }

  serverLogger.info(`All assets processed for submission: ${submissionData.id}`);

  try {
    serverLogger.info(`Attempting final repository cleanup for submission: ${submissionData.id}, Path: ${repositoryPath}`);
    await RootFileService.deleteRepository(repositoryPath);
    serverLogger.info(`Repository successfully cleaned up for submission: ${submissionData.id}`);
  } catch (cleanupError) {
    serverLogger.error(`Error during final repository cleanup for ${repositoryPath}:`, cleanupError);
    throw new FinalizeVideoError(
      `Asset processing completed, but failed to cleanup repository ${repositoryPath}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
      {
        queueDir: repositoryPath,
        videoAssetId: assetRepository.getAsset('original_video')?.assetId || 'unknown'
      }
    );
  }

  return;
}
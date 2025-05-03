import { Job } from "bullmq";
import { extractAudio } from "@server/services/ffmpeg";
import { getAssetById, getAssetBySubmissionId } from "@server/services/db/assets.services";
import { writeR2ObjToFile } from "@server/services/r2";
import { ProcessNewVideoData } from "@server/queues/process-new-video/types";
import { VIDEO_SETUP_QUEUE } from "@server/queues/process-new-video/queue-names";
import { RollupQueueErrorData, RollupQueueError } from "@server/queues/process-new-video/types";
import sendClientUpdate from "@server/queues/helpers";
import { serverLogger } from "@server/lib/configs/logger";

export class ProcessVideoError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, VIDEO_SETUP_QUEUE, data);
    this.name = 'ProcessVideoError';
  }
};

/**
 * Sets up the assets for the video.
 * 1) Fetch the original video asset from the database.
 * 2) Create an empty .mp3 & .mp4 file for the audio & original video assets.
 * 3) Write the original video to the file system.
 * 4) Extract the audio from the original video.
 * 
 * @param job - The job object of the worker for a queue.
 * @throws {ProcessVideoError} - If the video asset is not found.
 * @returns The assets for the video.
 */
export async function setupAssetsWorker(job: Job<ProcessNewVideoData>) {
  const { data, updateProgress } = job;
  const { submissionData, assetRepository } = data;

  await updateProgress({
    progress: 6,
    message: 'Fetching original video information...'
  });

  const originalVideo = await getAssetBySubmissionId(submissionData.id);

  if (!originalVideo) {
    throw new ProcessVideoError('Original video asset not found', {
      queueDir: VIDEO_SETUP_QUEUE,
      videoAssetId: submissionData.id,
    });
  };

  let message: string = "";

  const [
    audioFile,
    videoFile,
  ] = await Promise.all([
    assetRepository.createAsset('audio', `output-${originalVideo.id}.mp3`),
    assetRepository.createAsset('original_video', `input-${originalVideo.id}.mp4`),
  ]);

  message = 'Downloading video...';

  serverLogger.info(message);
  await updateProgress({
    progress: 12,
    message
  });

  await writeR2ObjToFile(originalVideo.r2Key, "original_videos", videoFile);

  message = 'Video downloaded, extracting audio...';

  serverLogger.info(message);
  await updateProgress({
    progress: 24,
    message
  });

  await extractAudio(videoFile, audioFile);

  message = 'Audio extracted, ready for processing...';

  serverLogger.info(message);
  await updateProgress({
    progress: 33,
    message
  });

  return
};
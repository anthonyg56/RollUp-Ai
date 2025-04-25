// Third-party imports
import { Worker } from "bullmq";

// Queue-related imports
import redisConnection from "@server/queues/redis-connection";
import { PROCESS_VIDEO_QUEUE } from "@server/queues/queue-names";

// Service imports
import { burnCaptions } from "@server/services/ffmpeg";
import { ProcessNewVideoData } from "@server/queues/types";

const processAudioWorker = new Worker<ProcessNewVideoData>(
  PROCESS_VIDEO_QUEUE,
  async ({ data: { assetRepository, submissionData } }) => {
    if (!submissionData.generateCaptions) {
      return;
    }

    const tempFiles = []; // Track temporary files

    try {
      // Get required assets
      const optVideoAsset = assetRepository.getAsset('optimized_videos');
      const srtTranscriptAsset = assetRepository.getAsset('srt_transcripts');

      if (!optVideoAsset?.path) {
        throw new Error('Optimized video asset not found');
      } else if (!srtTranscriptAsset?.path) {
        throw new Error('SRT transcript asset not found');
      }

      // Create output file
      const captionedVideoFile = await assetRepository.createAsset(
        'captioned_videos',
        `output-${submissionData.id}.mp4`
      );
      tempFiles.push(captionedVideoFile);

      // Process captions
      await burnCaptions(
        optVideoAsset.path,
        captionedVideoFile,
        srtTranscriptAsset.path
      );

      return;
    } catch (error) {
      // Clean up any temporary files if processing fails
      await Promise.allSettled(
        tempFiles.map(async (filePath) => {
          const assetKey = assetRepository.getAssetKeyByPath(filePath);

          await assetRepository.removeAsset(assetKey).catch(err =>
            console.error(`Failed to cleanup temporary file ${filePath}:`, err)
          )
        })
      );
      throw error; // Re-throw to maintain error handling
    }
  }, {
  connection: redisConnection,
  autorun: false,
}
);

export default processAudioWorker;
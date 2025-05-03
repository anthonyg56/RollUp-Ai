import { PROCESS_BROLL_QUEUE } from "@server/queues/process-new-video/queue-names";
import { generateKeywords, generateTranscripts } from "@server/services/ai";
import { Job } from "bullmq";
import { ProcessNewVideoData } from "@server/queues/process-new-video/types";
import { fetchBrollClips } from "@server/services/pexels";
import { RollupQueueErrorData, RollupQueueError } from "@server/queues/process-new-video/types";
import { mergeBrollClips } from "@server/services/ffmpeg";
import { serverLogger } from "@server/lib/configs/logger";

export class ProcessBrollError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, PROCESS_BROLL_QUEUE, data);
    this.name = 'ProcessBrollError';
  }
};

/**
 * Worker responsible for processing the b-roll clips of a video.
 * 
 * Overview:
 * - 1) Utilizes AI to generate the transcripts and keywords.
 * - 2) fetches relevant b-roll clips from Pexels based on the data from the AI.
 * - 3) Merge the b-roll clips into a single video file.
 * 
 * @param job - The job object of the worker for a queue.
 * 
 * @throws {ProcessBrollError} - If the audio file is not found.
 * @throws {ProcessBrollError} - If the original video asset is not found.
 * @throws {ProcessBrollError} - If no b-roll clips are found.
 * 
 * @returns The assets for the video.
 */
export async function processBrollWorker(job: Job<ProcessNewVideoData>) {
  const { data, updateProgress } = job;
  const { submissionData, assetRepository } = data;

  let message: string = "";

  if (!submissionData.generateBroll) {
    message = 'Skipping b-roll generation...';

    serverLogger.info(message);
    await updateProgress({
      progress: 66,
      message
    });

    return;
  };

  const originalVideo = assetRepository.getAsset('original_video');

  message = 'Initializing b-roll generation...';

  serverLogger.info(message);
  await updateProgress({
    progress: 35,
    message
  });

  const srtTranscript = await generateTranscripts(assetRepository.getAsset('audio').path, 'srt')
    .then(async transcript => {
      await assetRepository.createAsset('srt_transcript', `output-${submissionData.id}.srt`);

      assetRepository.writeContent('srt_transcript', transcript);
      return transcript;
    });

  const keywords = await generateKeywords(srtTranscript);

  message = 'Generating keywords...';

  serverLogger.info(message);
  await updateProgress({
    progress: 40,
    message
  });

  const brollClips = await fetchBrollClips(originalVideo.path, keywords);
  const generatedVideoFile = await assetRepository.createAsset('generated_video', `output-${submissionData.id}.mp4`);

  const shouldGenerateCaptions = submissionData.generateCaptions && srtTranscript ? srtTranscript : undefined;

  await mergeBrollClips(originalVideo.path, brollClips, generatedVideoFile, shouldGenerateCaptions);

  message = 'B-roll generation complete...';

  serverLogger.info(message);
  await updateProgress({
    progress: 66,
    message
  });

  return;
}
// Third-party imports
import { Job } from "bullmq";

// Service imports
import { burnCaptions } from "@server/services/ffmpeg";
import { PROCESS_AUDIO_QUEUE } from "@server/queues/process-new-video/queue-names";
import { ProcessNewVideoData, RollupQueueError, RollupQueueErrorData } from "@server/queues/process-new-video/types";
import { serverLogger } from "@server/lib/configs/logger";

export class ProcessAudioError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, PROCESS_AUDIO_QUEUE, data);
    this.name = 'ProcessAudioError';
  }
};

export async function generateCaptionsWorker(job: Job<ProcessNewVideoData>) {
  const { data, updateProgress } = job;
  const { assetRepository, submissionData } = data;

  const generatedVideo = assetRepository.getAsset('generated_video');

  if (generatedVideo || !submissionData.generateCaptions) {
    serverLogger.info('Skipping captions generation...');
    return;
  };

  await updateProgress({
    progress: 35,
    message: 'Generating captions...'
  });

  const originalVideo = assetRepository.getAsset('original_video');

  if (!originalVideo?.path) {
    throw new ProcessAudioError('Original video asset not found', {
      queueDir: PROCESS_AUDIO_QUEUE,
      videoAssetId: originalVideo?.assetId || 'unknown',
    });
  }

  await updateProgress({
    progress: 40,
    message: 'Creating srt transcript asset...'
  });

  const srtTranscript = await assetRepository.createAsset('srt_transcript', `output-${submissionData.id}.srt`);

  if (!srtTranscript) {
    throw new ProcessAudioError('Failed to create srt transcript asset', {
      queueDir: PROCESS_AUDIO_QUEUE,
      videoAssetId: originalVideo?.assetId || 'unknown',
    });
  }
  await assetRepository.writeContent('srt_transcript', srtTranscript);
  const captionedVideoFile = await assetRepository.createAsset(
    'captioned_video',
    `output-${submissionData.id}.mp4`
  );

  if (!captionedVideoFile) {
    throw new ProcessAudioError('Failed to create captioned video asset', {
      queueDir: PROCESS_AUDIO_QUEUE,
      videoAssetId: originalVideo?.assetId || 'unknown',
    });
  }

  await burnCaptions(
    originalVideo.path,
    captionedVideoFile,
    srtTranscript
  );

  return;
};

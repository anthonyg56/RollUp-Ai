// Third-party imports
import { Worker } from "bullmq";

// Queue-related imports
import { PROCESS_AUDIO_QUEUE } from "@server/queues/config/queue-names";
import { IProcessAudioData, IProcessAudioResult } from "@server/queues/queues/process-audio.queue";
import redisConnection from "@server/queues/config/redis-connection";

// Service imports
import { generateTranscripts } from "@server/services/ai";
import { burnCaptions, extractAudio } from "@server/services/ffmpeg";
import { uploadTranscripts } from "@server/services/db/video_transcription";
import { uploadAsset } from "@server/services/db/assets.services";

const processAudioWorker = new Worker<IProcessAudioData, IProcessAudioResult>(PROCESS_AUDIO_QUEUE, async (job) => {
  const { userId, submissionInfo } = job.data;
  const { optimizedVideoPath } = job.returnvalue;

  const audioPath = await extractAudio(optimizedVideoPath);

  if (!submissionInfo.generateCaptions) {
    return {
      ...job.returnvalue,
      audioPath,
    };
  }

  const { srtTranscript, plainTranscript } = await generateTranscripts(audioPath);
  const { originalVideoAsset } = job.returnvalue;

  await uploadTranscripts(userId, originalVideoAsset.videoSubmissionId, {
    srtTranscript,
    plainTranscript,
  });

  const captionedVideoPath = await burnCaptions(optimizedVideoPath, srtTranscript, originalVideoAsset.id);
  const {
    id: captionedVideoAssetId,
    r2Key: captionedVideoAssetR2Key,
    r2ETag: captionedVideoAssetR2ETag,
  } = await uploadAsset({
    path: captionedVideoPath,
    userId,
    videoSubmissionId: originalVideoAsset.videoSubmissionId,
    bucketName: "captioned_videos",
    unlinkPath: false,
  });

  return {
    ...job.returnvalue,
    audioPath,
    captionedVideoAssetId,
    captionedVideoAssetR2Key,
    captionedVideoAssetR2ETag,
    captionedVideoPath,
    srtTranscript,
    plainTranscript,
  };
}, {
  connection: redisConnection,
  autorun: false,
});


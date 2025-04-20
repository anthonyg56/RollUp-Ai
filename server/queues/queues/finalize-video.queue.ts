import { FINALIZE_VIDEO_JOB, FINALIZE_VIDEO_QUEUE } from "@server/queues/config/queue-names";
import { Queue } from "bullmq";
import redisConnection from "@server/queues/config/redis-connection";

export interface IPrepareClientData {
  captionedVideoAssetId: string;
  srtTranscriptAssetId: string;
  plainTranscriptAssetId: string;
  brollVideoAssetId: string;
}

const finalizeVideoQueue = new Queue<IPrepareClientData>(FINALIZE_VIDEO_QUEUE, {
  connection: redisConnection,
});

finalizeVideoQueue.on('cleaned', (jobId, result) => {
  console.log(`Job ${jobId} completed with result: ${result}`);
});

finalizeVideoQueue.on('error', (error) => {
  console.error(`Job failed with error: ${error}`);
});

finalizeVideoQueue.on('progress', (jobId, progress) => {
  console.log(`Job ${jobId} progress: ${progress}`);
});

export default finalizeVideoQueue;
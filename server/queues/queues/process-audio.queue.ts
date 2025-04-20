import { PROCESS_AUDIO_QUEUE } from "@server/queues/config/queue-names";
import { Queue } from "bullmq";
import redisConnection from "@server/queues/config/redis-connection";
import { IProcessVideoData, IProcessVideoResults } from "./process-video.queue";

export interface IProcessAudioData extends IProcessVideoData { }

export interface IProcessAudioResult extends IProcessVideoResults {
  audioPath: string | null;
  srtTranscript: string | null;
  plainTranscript: string | null;
  captionedVideoAssetId: string | null;
  captionedVideoPath: string | null;
}

const processAudioQueue = new Queue<IProcessAudioData, IProcessAudioResult>(PROCESS_AUDIO_QUEUE, {
  connection: redisConnection,
});

processAudioQueue.on('cleaned', (jobId, result) => {
  console.log(`Job ${jobId} completed with result: ${result}`);
});

processAudioQueue.on('error', (error) => {
  console.error(`Job failed with error: ${error}`);
});

processAudioQueue.on('progress', (jobId, progress) => {
  console.log(`Job ${jobId} progress: ${progress}`);
});

export default processAudioQueue; 
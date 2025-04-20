import { Queue } from "bullmq";
import redisConnection from "../config/redis-connection";
import { PROCESS_BROLL_QUEUE } from "../config/queue-names";
import { IProcessAudioData, IProcessAudioResult } from "./process-audio.queue";
import { TranscriptAnalysis } from "@server/services/ai";
export interface IProcessBrollData extends IProcessAudioData { }

export interface IProcessBrollResult extends IProcessAudioResult {
  transcriptAnalysis: TranscriptAnalysis | null;
}

const generateBrollQueue = new Queue<IProcessBrollData, IProcessBrollResult>(PROCESS_BROLL_QUEUE, {
  connection: redisConnection,
});

generateBrollQueue.on('cleaned', (jobId, result) => {
  console.log(`Job ${jobId} completed with result: ${result}`);
});

generateBrollQueue.on('error', (error) => {
  console.error(`Job failed with error: ${error}`);
});

generateBrollQueue.on('progress', (jobId, progress) => {
  console.log(`Job ${jobId} progress: ${progress}`);
});

export default generateBrollQueue;


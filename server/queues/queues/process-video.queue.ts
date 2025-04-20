import { Queue } from 'bullmq';
import redisConnection from '@server/queues/config/redis-connection';
import {
  PROCESS_VIDEO_JOB,
  PROCESS_VIDEO_QUEUE
} from '@server/queues/config/queue-names';
import { IVideoFlowInput } from '../flows/video-processing.flow';
import { VideoAsset } from '@server/db/models';

export interface IProcessVideoData extends IVideoFlowInput { };

export interface IProcessVideoResults {
  originalVideoAsset: VideoAsset;
  optimizedVideoPath: string;
}

const processVideoQueue = new Queue<IProcessVideoData, IProcessVideoResults>(PROCESS_VIDEO_QUEUE, {
  connection: redisConnection,
});

processVideoQueue.on('cleaned', (jobId, result) => {
  console.log(`Job ${jobId} completed with result: ${result}`);
});

processVideoQueue.on('error', (error) => {
  console.error(`Job failed with error: ${error}`);
});

processVideoQueue.on('progress', (jobId, progress) => {
  console.log(`Job ${jobId} progress: ${progress}`);
});

export default processVideoQueue;
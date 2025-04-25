import {
  PROCESS_VIDEO_QUEUE
} from "@server/queues/queue-names";
import { Queue } from "bullmq";
import redisConnection from "@server/queues/redis-connection";
import { ProcessNewVideoData } from "@server/queues/types";

const ProcessVideoQueue = new Queue(PROCESS_VIDEO_QUEUE, {
  connection: redisConnection,
});

export {
  ProcessVideoQueue,
};
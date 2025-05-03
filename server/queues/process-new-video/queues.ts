import { Queue } from "bullmq";
import { defaultRedisConnection } from "@server/queues/reddis_connection";
import { PROCESS_VIDEO_QUEUE, VIDEO_SETUP_QUEUE, PROCESS_BROLL_QUEUE, PROCESS_AUDIO_QUEUE, FINALIZE_VIDEO_QUEUE, ProcessVideoQueueName } from "@server/queues/process-new-video/queue-names";

export default function getQueue(queueName: ProcessVideoQueueName) {
  let queue: Queue<any, any, string, any, any, string>;

  switch (queueName) {
    case PROCESS_VIDEO_QUEUE:
      queue = new Queue(PROCESS_VIDEO_QUEUE, {
        connection: defaultRedisConnection,
      });
    case VIDEO_SETUP_QUEUE:
      queue = new Queue(VIDEO_SETUP_QUEUE, {
        connection: defaultRedisConnection,
      });
    case PROCESS_BROLL_QUEUE:
      queue = new Queue(PROCESS_BROLL_QUEUE, {
        connection: defaultRedisConnection,
      });
    case PROCESS_AUDIO_QUEUE:
      queue = new Queue(PROCESS_AUDIO_QUEUE, {
        connection: defaultRedisConnection,
      });
    case FINALIZE_VIDEO_QUEUE:
      queue = new Queue(FINALIZE_VIDEO_QUEUE, {
        connection: defaultRedisConnection,
      });
    default:
      throw new Error(`Queue not found: ${queueName}`);
  }

  return queue;
};
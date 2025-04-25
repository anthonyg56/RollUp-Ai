import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { QueueEvents } from "bullmq";
import { serverLogger } from "@server/lib/configs/logger";
import { QEListener } from "@server/queues/listeners/QEListener";
import createRedisConn from "@server/queues/create-redis-conn";
import { PROCESS_VIDEO_QUEUE } from "@server/queues/queue-names";
import { ProcessVideoQueue } from "@server/queues/queues";

function getQueue(queueName: 'process-video-queue') {
  switch (queueName) {
    case PROCESS_VIDEO_QUEUE:
      return ProcessVideoQueue;
    default:
      throw new Error(`Queue not found: ${queueName}`);
  }
}

export interface QueueEventsSSEData {
  jobId: string;
  flowJobId: string;
  queueName: 'process-video-queue';
}

/**
 * Streams SSE events for a queue event listener.
 * @param c - The Hono context object.
 * @param {QueueEventsSSEData} param1 - The data for the queue event listener.
 * @returns {Promise<void>} A promise that resolves when the SSE stream is closed.
 */
export async function qeStreamSSE(c: Context, { jobId, flowJobId, queueName }: QueueEventsSSEData) {
  const queueEvenConnection = await createRedisConn('Queue Events', jobId);
  const queueEvents = new QueueEvents(queueName, {
    connection: queueEvenConnection,
  });

  return streamSSE(c, async (stream) => {
    const queueEventListener = new QEListener(stream, queueEvents, {
      jobId,
      flowJobId,
    });

    try {
      const rootJob = await getQueue(queueName).getJob(flowJobId);
      if (rootJob) {
        const state = await rootJob.getState();
        const progress = await rootJob.getProgress();
        queueEventListener.sendEvent('initial_state', { jobId: rootJob.id, state, progress });
        // More complex: Fetch children jobs using rootJob.getDependencies() etc. to give full picture
      } else {
        queueEventListener.sendEvent('error', { message: 'Flow job not found initially.' });
        queueEventListener.stopListening();
        stream.close();
      }
    } catch (err) {
      serverLogger.info(`Error fetching initial state for ${flowJobId}:`, err);
      queueEventListener.sendEvent('error', { message: 'Error fetching initial job state.' });
      queueEventListener.stopListening();
      stream.close();
    }
  });
};


import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { Job, QueueEvents } from "bullmq";
import { serverLogger } from "@server/lib/configs/logger";
import { QEListener } from "@server/queues/qe_listener";
import createRedisConn from "@server/queues/reddis_connection";
import { PROCESS_VIDEO_QUEUE, ProcessVideoQueueName, VIDEO_SETUP_QUEUE, PROCESS_BROLL_QUEUE, PROCESS_AUDIO_QUEUE, FINALIZE_VIDEO_QUEUE, SETUP_ASSETS_STEP, FINALIZE_VIDEO_STEP, GENERATE_BROLL_STEP, GENERATE_CAPTIONS_STEP, ProcessVideoStep } from "@server/queues/process-new-video/queue-names";
import getQueue from "./queues";
import { updateJobStatus } from "@server/services/db/video_processing_jobs.service";

export interface QueueEventsSSEData {
  jobId: string;
  flowJobId: string;
}

/**
 * Streams SSE events for a queue event listener.
 * @param c - The Hono context object.
 * @param {QueueEventsSSEData} param1 - The data for the queue event listener.
 * @returns {Promise<void>} A promise that resolves when the SSE stream is closed.
 */
export async function qeStreamSSE(c: Context, { jobId, flowJobId }: QueueEventsSSEData) {
  let currentQueueName: ProcessVideoQueueName = PROCESS_VIDEO_QUEUE;
  let currentQueue = getQueue(currentQueueName);

  return streamSSE(c, async (stream) => {
    const queueEventListener = new QEListener(
      stream,
      new QueueEvents(PROCESS_VIDEO_QUEUE, {
        connection: createRedisConn('Queue Events', jobId),
      }),
      {
        jobId,
        flowJobId,
        customListeners: {
          async completedListener({ jobId, returnvalue }, id) {
            const job = await Job.fromId(currentQueue, jobId);

            if (!job) {
              throw new Error(`Job not found: ${jobId}`);
            };

            let step = job.name as ProcessVideoStep;
            const assetRepository = job.data.assetRepository;

            updateJobStatus(jobId, "completed", step);

            if (step === FINALIZE_VIDEO_STEP) {

            }

            const { queueName: nextQueueName, queue: nextQueue } = getNextStep(step);

            currentQueue = nextQueue;
            currentQueueName = nextQueueName;
          },
        }
      }
    );

    try {
      const rootJob = await currentQueue.getJob(flowJobId);

      if (rootJob) {
        const state = await rootJob.getState();
        const progress = await rootJob.getProgress();
        queueEventListener.sendEvent('initial_state', { jobId: rootJob.id, state, progress });
        // More complex: Fetch children jobs using rootJob.getDependencies() etc. to give full picture
      } else {
        queueEventListener.sendEvent('error', { message: 'Flow job not found initially.' });
        stream.close();
      }
    } catch (err) {
      serverLogger.info(`Error fetching initial state for ${flowJobId}:`, err);
      queueEventListener.sendEvent('error', { message: 'Error fetching initial job state.' });
      stream.close();
    }
  });
};

function getNextStep(step: ProcessVideoStep) {
  let queueName: ProcessVideoQueueName;

  switch (step) {
    case SETUP_ASSETS_STEP:
      queueName = VIDEO_SETUP_QUEUE;
    case GENERATE_BROLL_STEP:
      queueName = PROCESS_BROLL_QUEUE;
      break;
    case GENERATE_CAPTIONS_STEP:
      queueName = PROCESS_AUDIO_QUEUE;
      break;
    case FINALIZE_VIDEO_STEP:
      queueName = FINALIZE_VIDEO_QUEUE;
      break;
    default:
      throw new Error(`Unknown step: ${step}`);
  }

  return {
    queueName,
    queue: getQueue(queueName),
  };
}

function getQueueByStep(step: ProcessVideoStep) {
  switch (step) {
    case SETUP_ASSETS_STEP:
      return getQueue(VIDEO_SETUP_QUEUE);
    case GENERATE_BROLL_STEP:
      return getQueue(PROCESS_BROLL_QUEUE);
    case GENERATE_CAPTIONS_STEP:
      return getQueue(PROCESS_AUDIO_QUEUE);
    case FINALIZE_VIDEO_STEP:
      return getQueue(FINALIZE_VIDEO_QUEUE);
  }
}

import { Worker } from "bullmq";
import { VIDEO_SETUP_QUEUE, PROCESS_BROLL_QUEUE, PROCESS_AUDIO_QUEUE, FINALIZE_VIDEO_QUEUE } from "@server/queues/process-new-video/queue-names";
import createRedisConn from "@server/queues/reddis_connection";
import { setupAssetsWorker, generateCaptionsWorker, processBrollWorker, finalizeVideoWorker } from "@server/queues/process-new-video/workers-impl";


const redisConnection = createRedisConn('Worker');

const createWorker = (queueName: string, processor: (job: any) => Promise<any>) => {
  const worker = new Worker(queueName, processor, {
    connection: redisConnection,
    concurrency: 5, // Adjust concurrency as needed
    limiter: { // Example limiter: max 10 jobs per 5 seconds
      max: 10,
      duration: 5000,
    },
  });

  worker.on('completed', (job, result) => {
    console.log(`Worker [${queueName}] completed job ${job.id} successfully with result:`, result);
  });

  worker.on('failed', (job, err) => {
    console.error(`Worker [${queueName}] failed job ${job?.id} with error:`, err);
  });

  worker.on('error', err => {
    console.error(`Worker [${queueName}] error:`, err);
  });

  console.log(`Worker started for job type: ${queueName}`);
  return worker;
};

// Create workers for each job type
export const workers = [
  createWorker(VIDEO_SETUP_QUEUE, setupAssetsWorker),
  createWorker(PROCESS_AUDIO_QUEUE, generateCaptionsWorker),
  createWorker(PROCESS_BROLL_QUEUE, processBrollWorker),
  createWorker(FINALIZE_VIDEO_QUEUE, finalizeVideoWorker),
];

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Shutting down workers...');
  await Promise.all(workers.map(worker => worker.close()));
  await redisConnection.quit(); // Close redis connection
  console.log('Workers shut down gracefully.');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown); // Handle termination signal
process.on('SIGINT', gracefulShutdown); // Handle Ctrl+C

console.log('Workers initialized and waiting for jobs...');

// Keep the worker process running (if this is the main entry point)
// If running via a process manager like PM2, this might not be necessary
// setInterval(() => {}, 1 << 30); // Keep alive hack if needed
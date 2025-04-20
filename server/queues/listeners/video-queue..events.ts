import { QueueEvents } from 'bullmq';
import redisConnection from '@server/queues/config/redis-connection';

const queueEvents = new QueueEvents('my-task-queue', {
  connection: redisConnection,
});

queueEvents.on('active', (jobId, result) => {
  console.log('Job completed:', jobId, result);
});

queueEvents.on('error', err => {
  console.error('QueueEvents Error:', err);
});

export default queueEvents;
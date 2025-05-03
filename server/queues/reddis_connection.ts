import { serverLogger } from '@server/lib/configs/logger';
import { Redis } from 'ioredis';

const redisPassword = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export default function createRedisConn(type: 'Queue Events' | 'Flow Job' | 'Queue' | 'Worker', jobId?: string) {
  serverLogger.info(`Initalizing a new ${type} Redis Connection`, {
    host: redisHost,
    port: redisPort,
    hasPassword: !!redisPassword
  });

  const connection = new Redis({
    password: redisPassword,
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      serverLogger.info(`Retrying Redis connection in ${delay}ms...`);
      return delay;
    },
    connectTimeout: 10000, // 10 seconds
    enableReadyCheck: true,
  });

  connection.on('error', (err) => serverLogger.error('Redis Connection Error:', err));

  connection.on('connecting', () => serverLogger.info('Connecting to Redis...'));

  connection.on('connect', () => serverLogger.info('Connected to Redis!'));

  connection.on('reconnecting', () => serverLogger.info('Reconnecting to Redis...'));

  connection.on('ready', () => serverLogger.info('Redis client ready!'));

  return connection;
};

export const defaultRedisConnection = createRedisConn('Queue Events');
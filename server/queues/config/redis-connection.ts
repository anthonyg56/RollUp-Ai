import { Redis } from 'ioredis';
import { serverLogger } from '@server/lib/configs/logger';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
})

redisConnection.on('error', (err) => serverLogger.error('Redis Connection Error:', err));

redisConnection.on('connect', () => serverLogger.info('Connecting to Redis...'));

redisConnection.on('reconnecting', () => serverLogger.info('Reconnecting to Redis...'));

redisConnection.on('ready', () => serverLogger.info('Redis client ready!'));

export default redisConnection;
import app from '@server/app'
import { APP_PORT } from '@server/lib/constants'
import { serverLogger } from '@server/lib/configs/logger'

Bun.serve({
  fetch: app.fetch,
  port: APP_PORT,
});

serverLogger.info(`Starting server on port ${APP_PORT}`);
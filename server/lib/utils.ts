import { HTTPException } from "hono/http-exception";
import { serverLogger } from "@server/lib/configs/logger";

export async function handleError(error: unknown, message?: string) {
  if (error instanceof HTTPException) {
    throw error;
  } else if (error instanceof Error && !message) {
    throw new HTTPException(500, {
      message: error.message,
      cause: error,
    });
  } else {
    serverLogger.error(error);
    throw new HTTPException(500, {
      message: message || 'Internal server error',
      cause: error,
    });
  };
};

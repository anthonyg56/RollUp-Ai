import winston from "winston";
import path from "path";
import fs from "fs";

const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf, prettyPrint } = format;

const logDirectory = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDirectory)) {
  try {
    fs.mkdirSync(logDirectory, { recursive: true });
    console.log(`Log directory created at: ${logDirectory}`);
  } catch (err) {
    console.error(`Error creating log directory: ${logDirectory}`, err);
    process.exit(1);
  }
}

const consoleFormat = printf(
  ({ level, message, label, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${label}] ${level}: ${message}`;
    if (metadata && Object.keys(metadata).length > 0) {
      msg += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`; // Added "Metadata: " prefix and pretty printing
    }
    return msg;
  }
);

const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  prettyPrint(),
  format.json()
);

const consoleTransport = new transports.Console({
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.colorize(),
    prettyPrint(),
    consoleFormat
  ),
});

export const clientLogger = createLogger({
  level: process.env.LOG_LEVEL_CLIENT || "info",
  format: combine(label({ label: "Client" }), fileFormat),
  transports: [
    consoleTransport,
    new transports.File({
      filename: path.join(logDirectory, "client-combined.log"),
      format: fileFormat,
    }),
    new transports.File({
      filename: path.join(logDirectory, "client-error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
});

export const serverLogger = createLogger({
  level: process.env.LOG_LEVEL_SERVER || "info",
  format: combine(label({ label: "Server" }), fileFormat),
  transports: [
    consoleTransport,
    new transports.File({
      filename: path.join(logDirectory, "server-combined.log"),
      format: fileFormat,
    }),
    new transports.File({
      filename: path.join(logDirectory, "server-error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

export const databaseLogger = createLogger({
  level: process.env.LOG_LEVEL_DATABASE || "info",
  format: combine(label({ label: "Database" }), fileFormat),
  transports: [
    consoleTransport,
    new transports.File({
      filename: path.join(logDirectory, "database-combined.log"),
      format: fileFormat,
    }),
    new transports.File({
      filename: path.join(logDirectory, "database-error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
});

export const filesystemLogger = createLogger({
  level: process.env.LOG_LEVEL_FILESYSTEM || "info",
  format: combine(label({ label: "Filesystem" }), fileFormat),
  transports: [
    consoleTransport,
    new transports.File({
      filename: path.join(logDirectory, "filesystem-combined.log"),
      format: fileFormat,
    }),
    new transports.File({
      filename: path.join(logDirectory, "filesystem-error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
});

export const streamingLogger = createLogger({
  level: process.env.LOG_LEVEL_STREAMING || "info",
  format: combine(label({ label: "Streaming" }), fileFormat),
  transports: [
    consoleTransport,
    new transports.File({
      filename: path.join(logDirectory, "streaming-combined.log"),
      format: fileFormat,
    }),
    new transports.File({
      filename: path.join(logDirectory, "streaming-error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
})
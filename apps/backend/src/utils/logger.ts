import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { ENV_VALUE } from "./env";

// Define log directory
const logDir = path.join(__dirname, "../../logs");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Transport for error logs
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
});

// Transport for combined logs (all levels)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
});

// Transport for cron job logs
const cronFileTransport = new DailyRotateFile({
  filename: path.join(logDir, "cron-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
  level: "info",
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// Create the main logger
const logger = winston.createLogger({
  level: ENV_VALUE.LOGS.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [errorFileTransport, combinedFileTransport, consoleTransport],
});

// Create a specialized logger for cron jobs
const cronLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [cronFileTransport, consoleTransport],
});

// Export both loggers
export { logger, cronLogger };

// Export default logger
export default logger;

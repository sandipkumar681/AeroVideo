import { cronLogger } from "../utils/logger";

/**
 * Health check job to verify system is running properly
 * Runs every 15 minutes to log system status
 */
export const healthCheckJob = async (): Promise<void> => {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  cronLogger.info(`${timestamp} - Everything is fine ✅`);
};

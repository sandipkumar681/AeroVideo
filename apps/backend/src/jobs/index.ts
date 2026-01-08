import cron from "node-cron";
import { cleanupExpiredRefreshTokens } from "./tokenCleanup.job";
import { healthCheckJob } from "./healthCheck.job";

/**
 * Initialize and start all cron jobs
 */
export const startCronJobs = (): void => {
  console.log("Initializing cron jobs...");

  // Clean up expired refresh tokens daily at 2:00 AM
  // Cron format: minute hour day month weekday
  // '0 2 * * *' = At 02:00 AM every day
  cron.schedule("0 2 * * *", async () => {
    console.log("Executing scheduled token cleanup job...");
    await cleanupExpiredRefreshTokens();
  });

  console.log("Token cleanup job scheduled: Daily at 2:00 AM");

  // Health check job - runs every 15 minutes
  // '*/15 * * * *' = Every 15 minutes
  cron.schedule("*/10 * * * *", async () => {
    await healthCheckJob();
  });

  console.log("Health check job scheduled: Every 15 minutes");

  // Optional: Run cleanup once on startup (for testing/immediate cleanup)
  // Uncomment the line below if you want to run cleanup when server starts
  // cleanupExpiredRefreshTokens();
};

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export const stopCronJobs = (): void => {
  cron.getTasks().forEach((task) => task.stop());
  console.log("All cron jobs stopped");
};

import cron from "node-cron";
import { cleanupExpiredRefreshTokens } from "./tokenCleanup.job";
import { healthCheckJob } from "./healthCheck.job";
import { cleanupStalePendingPayments } from "./paymentCleanup.job";

export const startCronJobs = (): void => {
  console.log("Initializing cron jobs...");

  cron.schedule("0 */12 * * *", async () => {
    console.log("Executing scheduled token cleanup job...");
    await cleanupExpiredRefreshTokens();
  });

  console.log("Token cleanup job scheduled: Every 12 hours");

  cron.schedule("0 */12 * * *", async () => {
    await healthCheckJob();
  });

  console.log("Health check job scheduled: Every 12 hours");

  cron.schedule("0 */6 * * *", async () => {
    console.log("Executing scheduled payment cleanup job...");
    await cleanupStalePendingPayments();
  });

  console.log("Payment cleanup job scheduled: Every 6 hours");
};

export const stopCronJobs = (): void => {
  cron.getTasks().forEach((task) => task.stop());
  console.log("All cron jobs stopped");
};

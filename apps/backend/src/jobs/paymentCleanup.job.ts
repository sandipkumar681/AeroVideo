import { deleteStalePendingPayments } from "../services/payment.services";

export const cleanupStalePendingPayments = async (): Promise<void> => {
  try {
    console.log("Starting stale pending payment cleanup...");

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const result = await deleteStalePendingPayments(oneHourAgo);

    console.log(
      `Payment cleanup completed: ${result.deletedCount} stale pending payments removed`,
    );
  } catch (error) {
    console.error("Error during payment cleanup:", error);
  }
};

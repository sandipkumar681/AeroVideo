import { Payment } from "../models/payment.models";

export const deleteStalePendingPayments = async (olderThan: Date) => {
  return await Payment.deleteMany({
    status: { $in: ["created", "failed"] },
    createdAt: { $lt: olderThan },
  });
};

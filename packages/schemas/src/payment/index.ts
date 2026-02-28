import { z } from "zod";

export const createOrderSchema = z.object({
  donorName: z
    .string()
    .min(3, { message: "Donor name must be at least 3 characters long" }),
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, { message: "Order ID is required" }),
  razorpay_payment_id: z.string().min(1, { message: "Payment ID is required" }),
  razorpay_signature: z.string().min(1, { message: "Signature is required" }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

import { AsyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ENV_VALUE } from "../utils/env";
import { Payment } from "../models/payment.models";
import { createOrderSchema, verifyPaymentSchema } from "@aerovideo/schemas";

const razorpay = new Razorpay({
  key_id: ENV_VALUE.RAZORPAY.KEY_ID,
  key_secret: ENV_VALUE.RAZORPAY.KEY_SECRET,
});

export const createOrder = AsyncHandler(async (req, res) => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, `${result.error.issues[0].message}`);
  }

  const { donorName, amount } = result.data;

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);

    if (!order) {
      throw new ApiError(
        500,
        "Some error occurred while creating Razorpay order",
      );
    }

    // Save payment intent logic (status created)
    const newPayment = await Payment.create({
      donorName,
      amount,
      currency: "INR",
      status: "created",
      razorpayOrderId: order.id,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { order, paymentId: newPayment._id },
          "Order created successfully",
        ),
      );
  } catch (error) {
    console.error("Razorpay inner error", error);
    throw new ApiError(500, "Payment Gateway Error");
  }
});

export const verifyPayment = AsyncHandler(async (req, res) => {
  const result = verifyPaymentSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, `${result.error.issues[0].message}`);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    result.data;

  const shasum = crypto.createHmac("sha256", ENV_VALUE.RAZORPAY.KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpay_signature) {
    // If validation fails
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: "failed" },
    );
    throw new ApiError(400, "Transaction is not legit!");
  }

  // Payment signature verified
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: "successful",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    },
    { new: true },
  );

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { payment }, "Payment verified successfully"));
});

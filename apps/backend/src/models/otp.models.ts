import mongoose from "mongoose";
import { minLengthOfOtp, maxLengthOfOtp } from "../constants";
import { IOtp, IOtpModel } from "@aerovideo/types";
import { ENV_VALUE } from "../utils/env";

const otpSchema = new mongoose.Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: {
      type: Number,
      required: true,
      min: minLengthOfOtp,
      max: maxLengthOfOtp,
    },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// TTL index: auto-delete document after 900 seconds (15 minutes)
otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Number(ENV_VALUE.EMAIL.OTP_EXPIRY_TIME) }
);

export const Otp = mongoose.model<IOtp, IOtpModel>("Otp", otpSchema);

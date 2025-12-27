import { Otp } from "../models/otp.models";
import { IOtp } from "@servicely/types";
import { ApiError } from "../utils/apiError";

export const saveOtp = async (email: string, otp: string) => {
  try {
    const createdAt = new Date();
    const exists: IOtp | null = await Otp.findOne({ email });

    if (exists) {
      await Otp.findOneAndUpdate({ email }, { otp, createdAt });
    } else {
      await Otp.create({ email, otp: Number(otp), createdAt });
    }
  } catch (error) {
    throw new ApiError(500, `❌ Error in saveOtp(): ${error}`);
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const otpInDb = await Otp.findOne({ email });
    return Number(otp) === otpInDb?.otp;
  } catch (error) {
    throw new ApiError(500, `❌ Error in verifyOtp(): ${error}`);
  }
};

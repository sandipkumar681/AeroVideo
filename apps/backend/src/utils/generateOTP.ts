import { maxLengthOfOtp, minLengthOfOtp } from "../constants";

export const generateOTP = () => {
  const otp =
    Math.floor(Math.random() * (maxLengthOfOtp - minLengthOfOtp + 1)) +
    minLengthOfOtp;
  return otp.toString();
};

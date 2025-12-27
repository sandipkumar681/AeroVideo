import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AsyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { generateOTP } from "../utils/generateOTP";
import { saveOtp } from "../services/otp.services";
import { transporter } from "../services/mail.services";
import { getEmailTemplates } from "../utils/emailTemplate";
import { ENV_VALUE } from "../utils/env";

interface SendMailBody {
  ToCreateProfile: boolean;
  email: string;
}

const sendMail = AsyncHandler(
  async (req: Request<{}, {}, SendMailBody>, res: Response) => {
    const { ToCreateProfile, email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required!");
    }

    const otp = generateOTP();
    await saveOtp(email, otp);

    const { subject, text, html } = getEmailTemplates(otp, ToCreateProfile);

    await transporter.sendMail({
      from: ENV_VALUE.EMAIL.SENDER_GMAIL_ADDRESS,
      to: email,
      subject,
      text,
      html,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "OTP sent successfully!"));
  }
);

export default sendMail;

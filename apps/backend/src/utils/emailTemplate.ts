export const getEmailTemplates = (otp: string, ToCreateProfile: boolean) => {
  if (ToCreateProfile) {
    return {
      subject: "Welcome to Servicely! Your OTP for Account Setup",
      text: `Hello,

We're thrilled to have you join Servicely! To complete your profile setup, please use the OTP below:

OTP: ${otp}

This OTP is valid for 15 minutes. Please do not share it with anyone.

Best regards,
The Servicely Team`,
      html: `
        <div style="font-family: Arial; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Welcome to Servicely!</h2>
          <p>To complete your profile setup, use the OTP below:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 20px;">
            <b>${otp}</b>
          </div>
        </div>
      `,
    };
  }

  return {
    subject: "Servicely Security Verification - OTP for Account Update",
    text: `Hello,

We received a request to update your account details.

OTP: ${otp}

Valid for 15 minutes.

Best regards,
Servicely Team`,
    html: `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2 style="color: #1a73e8;">Security Verification</h2>
        <p>Please use the OTP below:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 20px;">
          <b>${otp}</b>
        </div>
      </div>
    `,
  };
};

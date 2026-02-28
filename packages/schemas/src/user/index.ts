import { z } from "zod";

export const fullNameSchema = z
  .string()
  .min(3, { message: "fullName should be atleast 3 characters long" })
  .max(30, { message: "fullName should not be more than 30" });

export const userNameSchema = z
  .string()
  .min(3, { message: "userName should be atleast 3 characters long" })
  .max(30, { message: "userName should not be more than 30" });

export const emailSchema = z.string().email();

export const passwordSchema = z
  .string()
  .min(6, { message: "password should be atleast 6 characters long" });

export const otpSchema = z.string();

export const registerSchema = z.object({
  fullName: fullNameSchema,
  userName: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changeCurrentPasswordSchema = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const changeAccountDetailsSchema = z.object({
  fullName: fullNameSchema,
  userName: userNameSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema,
});

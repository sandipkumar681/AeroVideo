import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).required(),
  userName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  otp: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const changeCurrentPasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

export const changeAccountDetailsSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).required(),
  userName: Joi.string().min(3).max(30).required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

import mongoose, { Document, Model } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: number;
  createdAt: Date;
}

export interface IOtpModel extends Model<IOtp> {}

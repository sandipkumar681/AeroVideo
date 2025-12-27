import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "../constants";
import { ENV_VALUE } from "../utils/env";
import { ApiError } from "../utils/apiError";

export const connectDB = async (): Promise<Mongoose | void> => {
  try {
    const uri = `${ENV_VALUE.MONGO_URI}/${DB_NAME}`;

    const conn = await mongoose.connect(uri);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    throw new ApiError(500, `🔴 MongoDB connection error: ${error}`);
  }
};

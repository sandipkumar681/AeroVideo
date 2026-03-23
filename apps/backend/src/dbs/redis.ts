import { createClient } from "redis";
import { ENV_VALUE } from "../utils/env";

export const redisClient = createClient({
  url: ENV_VALUE.REDIS.URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("ready", () => console.log("✅ Redis Client Ready"));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Successfully connected to Redis");
  } catch (error) {
    console.error("❌ Failed to connect to Redis", error);
  }
};

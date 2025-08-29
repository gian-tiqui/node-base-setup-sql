import Redis from "ioredis";
import { DECIMAL_RADIX } from "@/constants/constants";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", DECIMAL_RADIX),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export { redis };

import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn("Redis connection attempts exceeded limit. Operating in cache-bypass mode.");
        return null;
      }
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    logger.info("Connected to Redis server successfully.");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    logger.warn(`Redis Error: ${err.message}. Cache bypass active.`);
  });
} catch (error: any) {
  logger.warn(`Failed to initialize Redis client: ${error?.message}`);
}

export const getRedisClient = (): Redis | null => {
  return isRedisConnected ? redisClient : null;
};

export { redisClient };

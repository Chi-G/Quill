import { getRedisClient } from "../config/redis.js";
import { logger } from "../utils/logger.js";

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      if (!client) return null;
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error: any) {
      logger.warn(`Cache GET error for key ${key}: ${error?.message}`);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds = 120): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;
      await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error: any) {
      logger.warn(`Cache SET error for key ${key}: ${error?.message}`);
    }
  }

  static async del(keyPattern: string): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;
      if (keyPattern.includes("*")) {
        const keys = await client.keys(keyPattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } else {
        await client.del(keyPattern);
      }
    } catch (error: any) {
      logger.warn(`Cache DEL error for key ${keyPattern}: ${error?.message}`);
    }
  }
}

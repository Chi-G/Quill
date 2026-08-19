import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("8000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/quill_cms"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  ACCESS_TOKEN_SECRET: z
    .string()
    .default("quill_access_token_secret_key_32chars_long_minimum"),
  ACCESS_TOKEN_EXPIRY: z.string().default("1d"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .default("quill_refresh_token_secret_key_32chars_long_minimum"),
  REFRESH_TOKEN_EXPIRY: z.string().default("30d"),
});

export const env = envSchema.parse(process.env);

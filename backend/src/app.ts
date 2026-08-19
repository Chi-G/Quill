import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { pinoHttp } from "pino-http";

import v1Router from "./routes/v1/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { swaggerSpec } from "./config/swagger.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app: Express = express();

// Structured HTTP Request Logging
app.use(pinoHttp({ logger }));

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes",
    success: false,
  },
});

app.use("/api", limiter);

// Body Parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Static Uploads Folder
app.use("/uploads", express.static("uploads"));

// Swagger OpenAPI Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get("/health", (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { status: "OK", timestamp: new Date() }, "Quill CMS is healthy"));
});

// Mount Versioned API Routes (/api/v1)
app.use("/api/v1", v1Router);

// Global Error Handler
app.use(errorHandler);

export default app;

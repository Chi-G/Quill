import express, { Express, Request, Response, NextFunction } from "express";
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

const SERVER_BOOT_TIME = Date.now();

// Dev-mode status check for Swagger UI auto-reload
app.get("/api-docs/dev-status", (req: Request, res: Response) => {
  return res.json({ bootTime: SERVER_BOOT_TIME });
});

// Swagger OpenAPI Documentation
app.use("/api-docs", (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

const autoReloadScript = `
  (function() {
    let currentBoot = null;
    setInterval(async () => {
      try {
        const res = await fetch('/api-docs/dev-status');
        if (res.ok) {
          const data = await res.json();
          if (currentBoot !== null && data.bootTime !== currentBoot) {
            console.log("🔄 Server restarted! Auto-reloading Swagger UI...");
            window.location.reload();
          }
          currentBoot = data.bootTime;
        }
      } catch (e) {}
    }, 1500);
  })();
`;

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customJs: `data:text/javascript;base64,${Buffer.from(autoReloadScript).toString("base64")}`,
  })
);

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

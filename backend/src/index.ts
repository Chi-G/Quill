import { connectDB } from "./config/db.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

import { WebhookService } from "./services/webhook.service.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    WebhookService.initListeners();

    const server = app.listen(env.PORT, () => {
      logger.info(`⚙️  Quill Engine running at http://localhost:${env.PORT}`);
      logger.info(`📚 Live Swagger Documentation at http://localhost:${env.PORT}/api-docs`);
    });

    server.on("error", (error: Error) => {
      logger.error(`HTTP Server Error: ${error.message}`);
    });
  } catch (err: any) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

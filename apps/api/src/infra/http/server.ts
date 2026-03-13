import { app } from "./app";
import { logger } from "@shared/utils/Logger";
import { DbProvider } from "../database/DbProvider";
import { env } from "../config/env";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} 🚀`);
});

// Graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed.");
    await DbProvider.close();
    logger.info("Database pool closed.");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

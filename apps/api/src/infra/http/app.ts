import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config({ path: [".env.development.local", ".env"] });
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";

import { logger } from "@shared/utils/Logger";
import { errorHandler } from "@shared/middlewares/ErrorHandler";
import { AppError } from "@shared/errors/AppError";
import "@shared/container";

import { routes } from "./routes";

const app = express();

// Security middleware
app.use(cors());
app.use(helmet());

// Rate limiting: 100 requests per 15-minute window per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      status: "error",
      message: "Too many requests, please try again later.",
    },
  }),
);

// Request logging
app.use(pinoHttp({ logger }));

// Body parsing
app.use(express.json());

// Routes
app.use(routes);

// Catch-all 404 handler (must be after routes, before error handler)
app.use((_req, _res, next) => {
  next(new AppError("API Route Not Found", 404));
});

// Global error handler (must be after routes)
app.use(errorHandler);

export { app };

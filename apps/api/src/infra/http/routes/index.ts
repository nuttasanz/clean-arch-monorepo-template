import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { ensureAuthenticated, ensureAdmin } from "@shared/middlewares";

const routes = Router();

// Health check (no versioning — public utility endpoint)
routes.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API v1
const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);

// Admin only route example
v1Router.get(
  "/admin/dashboard",
  ensureAuthenticated,
  ensureAdmin,
  (_req, res) => {
    return res.json({ message: "Welcome to the Admin Dashboard" });
  },
);

routes.use("/api/v1", v1Router);

export { routes };

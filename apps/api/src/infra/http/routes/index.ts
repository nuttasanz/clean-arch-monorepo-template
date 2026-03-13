import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { ensureAuthenticated, ensureAdmin } from "@shared/middlewares";

const routes = Router();

// Health check (no auth required)
routes.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

routes.use("/auth", authRouter);
routes.use("/users", userRouter);

// Admin only route example
routes.get("/admin/dashboard", ensureAuthenticated, ensureAdmin, (req, res) => {
  return res.json({ message: "Welcome to the Admin Dashboard" });
});

export { routes };

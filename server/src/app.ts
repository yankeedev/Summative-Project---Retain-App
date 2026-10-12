import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import authRouter from "./routes/auth";
import budgetsRouter from "./routes/budgets";
import categoriesRouter from "./routes/categories";
import expensesRouter from "./routes/expenses";

export function createApp(): express.Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());
  if (env.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/expenses", expensesRouter);
  app.use("/api/budgets", budgetsRouter);
  return app;
}
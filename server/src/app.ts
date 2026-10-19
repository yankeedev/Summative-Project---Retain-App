import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env, isAllowedOrigin } from "./config/env";
import authRouter from "./routes/auth";
import budgetsRouter from "./routes/budgets";
import categoriesRouter from "./routes/categories";
import expensesRouter from "./routes/expenses";
import adminRouter from "./routes/admin";
export function createApp(): express.Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // No origin: same-origin request, curl, or a server-to-server call
        if (!origin || isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  if (env.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  // Health check (the /api alias lets the serverless entrypoint rewrite /health)
  app.get(["/health", "/api/health"], (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/expenses", expensesRouter);
  app.use("/api/budgets", budgetsRouter);
  app.use("/api/admin", adminRouter);
  return app;
}
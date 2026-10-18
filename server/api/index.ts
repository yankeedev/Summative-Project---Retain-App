import { createApp } from "../src/app";
import { connectDb } from "../src/config/db";
import serverless from "serverless-http";
import mongoose from "mongoose";

const app = createApp();
let handler: any;

export default async (req: any, res: any) => {
  // Strip Vercel's /api prefix if present so Express matches routes correctly
  if (req.url && req.url.startsWith("/api/")) {
    req.url = req.url.replace(/^\/api/, "") || "/";
  } else if (req.url === "/api") {
    req.url = "/";
  }

  if (mongoose.connection.readyState === 0) {
    try {
      await connectDb();
    } catch (err) {
      console.error("DB connection error:", err);
    }
  }
  if (!handler) {
    handler = serverless(app);
  }
  return handler(req, res);
};

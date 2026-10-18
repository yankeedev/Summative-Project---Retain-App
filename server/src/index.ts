import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import serverless from "serverless-http";
import mongoose from "mongoose";

const app = createApp();
let handler: any;

export default async (req: any, res: any) => {
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

if (!process.env.VERCEL) {
  void connectDb().then(() => {
    app.listen(env.port, () => {
      console.log(`Retain API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    });
  });
}

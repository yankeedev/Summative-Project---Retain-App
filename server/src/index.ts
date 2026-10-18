import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function start(): Promise<void> {
  if (process.env.VERCEL) {
    return;
  }

  try {
    await connectDb();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Retain API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

void start();

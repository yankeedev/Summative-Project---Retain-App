import { createApp } from "../src/app";
import { connectDb } from "../src/config/db";
import serverless from "serverless-http";
import mongoose from "mongoose";

let handler: any;

async function getHandler() {
  if (!handler) {
    if (mongoose.connection.readyState === 0) {
      await connectDb();
    }
    const app = createApp();
    handler = serverless(app);
  }
  return handler;
}

export default async (req: any, res: any) => {
  try {
    const h = await getHandler();
    return h(req, res);
  } catch (err) {
    console.error("Serverless invocation error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ 
      error: "Internal Server Error", 
      message: err instanceof Error ? err.message : String(err) 
    }));
  }
};

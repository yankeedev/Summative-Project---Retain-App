import mongoose from "mongoose";
import { env } from "./env";
import { seedDefaults } from "./seed";

export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await seedDefaults();
}

import mongoose from "mongoose";
import { env } from "./env";
import { seedDefaults } from "./seed";

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  await seedDefaults();
}
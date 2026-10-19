import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function start(): Promise<void> {
  if (!env.mongoUri) {
    console.error(
      "MONGO_URI is not set. Add your MongoDB Atlas connection string " +
        "(mongodb+srv://user:pass@cluster/...) to this service's environment variables."
    );
    process.exit(1);
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
    console.log(
      `Allowed client origins: ${[...env.clientOrigins, ...env.clientOriginPatterns.map((p) => p.source)].join(", ")}`
    );
    if (
      env.nodeEnv === "production" &&
      env.clientOriginPatterns.length === 0 &&
      env.clientOrigins.every((origin) => origin.includes("localhost"))
    ) {
      console.warn(
        "CLIENT_ORIGIN only allows localhost. Set it to your deployed frontend URL " +
          "(e.g. https://your-app.vercel.app) or browser requests will be blocked by CORS."
      );
    }
  });
}

void start();

import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../src/app";
import { connectDb } from "../src/config/db";

export type Connect = () => Promise<void>;
export type VercelHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>;

// Vercel invokes the function with the original request URL, which may or may
// not include the /api prefix the routers are mounted on.
export function normalizeUrl(raw: string): string {
  const url = raw || "/";
  if (url === "/api" || url.startsWith("/api/") || url.startsWith("/api?")) return url;
  return `/api${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Builds the serverless request handler. `connect` is injected so tests can
 * drive the handler without a database; production uses `connectDb`.
 */
export function createHandler(connect: Connect = connectDb): VercelHandler {
  const app = createApp();
  const handle = app as unknown as (req: IncomingMessage, res: ServerResponse) => void;

  // Reused across warm invocations so one connection serves many requests
  let pending: Promise<void> | null = null;

  return async function handler(req, res): Promise<void> {
    try {
      if (!pending) {
        pending = connect().finally(() => {
          pending = null;
        });
      }
      await pending;
    } catch (err) {
      console.error("MongoDB connection failed:", err);
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Database unavailable" }));
      return;
    }

    req.url = normalizeUrl(req.url ?? "/");
    handle(req, res);
  };
}

export default createHandler();

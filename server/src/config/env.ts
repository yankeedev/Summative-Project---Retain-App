import dotenv from "dotenv";

dotenv.config();

// Vite falls back to 5174+ when 5173 is taken, so allow both by default
export const DEFAULT_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

export interface OriginMatcher {
  exact: string[];
  patterns: RegExp[];
  allows(origin: string): boolean;
}

export function parseOriginList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Entries containing `*` are glob patterns, e.g. https://*-team.vercel.app
// which matches Vercel preview deployments. Everything else must match exactly.
export function toOriginPattern(glob: string): RegExp {
  const escaped = glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

export function createOriginMatcher(raw: string | undefined): OriginMatcher {
  const configured = parseOriginList(raw);
  const list = configured.length > 0 ? configured : DEFAULT_ORIGINS;
  const exact = list.filter((origin) => !origin.includes("*"));
  const patterns = list
    .filter((origin) => origin.includes("*"))
    .map(toOriginPattern);

  return {
    exact,
    patterns,
    allows(origin: string): boolean {
      return exact.includes(origin) || patterns.some((pattern) => pattern.test(origin));
    },
  };
}

const matcher = createOriginMatcher(process.env.CLIENT_ORIGIN);

export function isAllowedOrigin(origin: string): boolean {
  return matcher.allows(origin);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: (process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "").trim(),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientOrigins: matcher.exact,
  clientOriginPatterns: matcher.patterns,
};

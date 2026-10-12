import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// checck beare token & store it
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing authorization header" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice("Bearer ".length), env.jwtSecret) as jwt.JwtPayload;
    res.locals.userId = payload.sub as string;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
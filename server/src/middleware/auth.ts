import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

import { User } from "../models/User";

// verify 
export async function requireAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Missing authorization header" });
    return;
  }
  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

// check bearer token & store the userId
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
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload || typeof payload !== "object" || typeof (payload as { sub?: unknown }).sub !== "string") {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }
    req.user = { id: (payload as { sub: string }).sub };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

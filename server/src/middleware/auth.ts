import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export type AdminJwtPayload = { typ: "admin"; sub: string; email: string };

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (payload.typ !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    (req as Request & { adminPayload: AdminJwtPayload }).adminPayload = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export type ParticipantJwtPayload = { typ: "participant"; sub: string; code: string };

export function readParticipantToken(token: string): ParticipantJwtPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as ParticipantJwtPayload;
    if (payload.typ !== "participant") return null;
    return payload;
  } catch {
    return null;
  }
}

import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiResponse.js";

interface Options {
  windowMs: number;
  max: number;
  message?: string;
}

// Small in-memory limiter per IP. It protects Bedrock and GitHub from accidental floods.
export const rateLimit = ({ windowMs, max, message = "Too many requests, please slow down." }: Options): RequestHandler => {
  const hits = new Map<string, { count: number; resetAt: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, _res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) return next(new ApiError(429, message));
    next();
  };
};

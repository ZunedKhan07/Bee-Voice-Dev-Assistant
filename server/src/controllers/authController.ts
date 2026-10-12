import crypto from "crypto";
import type { RequestHandler } from "express";
import { ApiError, cleanText, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

const sha = (s: string): Buffer => crypto.createHash("sha256").update(s).digest();
const secret = (): string => process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (payload: string): string => crypto.createHmac("sha256", secret()).update(payload).digest("hex");

export const login = asyncHandler(async (req, res) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new ApiError(500, "ADMIN_PASSWORD is not set in .env");
  const password = cleanText(req.body?.password, 200);
  // Hash both sides so the buffers always have equal length for timingSafeEqual.
  if (!crypto.timingSafeEqual(sha(password), sha(expected))) throw new ApiError(401, "Wrong password");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  sendSuccess(res, { token: `${expiresAt}.${sign(String(expiresAt))}`, expiresAt }, "Logged in");
});

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [expStr, sig] = token.split(".");
  const expiresAt = Number(expStr);
  if (!sig || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return next(new ApiError(401, "Admin login required"));
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(String(expiresAt)));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return next(new ApiError(401, "Invalid admin token"));
  }
  next();
};

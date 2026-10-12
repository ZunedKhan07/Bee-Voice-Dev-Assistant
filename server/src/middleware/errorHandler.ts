import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiResponse.js";

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, "Route not found"));
};

export const errorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = "Internal server error";
  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
  } else if (typeof (err as { status?: unknown })?.status === "number" && (err as { status: number }).status < 500) {
    // body-parser errors: malformed JSON, payload too large
    status = (err as { status: number }).status;
    message = "Invalid request body";
  } else {
    console.error("[error]", err);
  }
  res.status(status).json({ success: false, message });
};

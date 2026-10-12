import type { Response } from "express";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const sendSuccess = <T>(res: Response, data: T, message = "OK", statusCode = 200): void => {
  res.status(statusCode).json({ success: true, message, data });
};

// Trim and cap user-supplied text; anything that is not a string becomes "".
export const cleanText = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

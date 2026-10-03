import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Admin Authentication Handler
export const verifyAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Password is required"));
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== adminPassword) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid Admin Credentials"));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { isAuthenticated: true },
      "Admin verification successful"
    )
  );
});
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { analyzeLogWithBedrock } from "../services/bedrockService.js";

// AI Mentor Q&A Handler
export const askMentor = asyncHandler(async (req: Request, res: Response) => {
  const { query, context } = req.body;

  if (!query || query.trim() === "") {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Query text is required"));
  }

  // Combine optional code context with user query
  const promptInput = context
    ? `Context:\n${context}\n\nStudent Question:\n${query}`
    : query;

  // Call Bedrock AI
  const aiResponse = await analyzeLogWithBedrock(promptInput);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        aiResponse,
        "Mentor guidance generated successfully"
      )
    );
});
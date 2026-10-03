import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Issue } from "../models/Issue.js";
import { Log } from "../models/Logs.js";
import { analyzeLogWithBedrock } from "../services/bedrockService.js";
import { createGitHubIssue } from "../services/githubService.js";
import { getIO } from "../config/socket.js";

// 1. Ingest raw log or voice transcript -> Call AI -> Create Issue Card -> Socket Broadcast
export const ingestLogOrVoice = asyncHandler(async (req: Request, res: Response) => {
  const { rawText, source = "text" } = req.body;

  if (!rawText || rawText.trim() === "") {
    return res.status(400).json(new ApiResponse(400, null, "Log text or voice transcript is required"));
  }

  // Step A: Call AWS Bedrock AI Engine
  const aiResult = await analyzeLogWithBedrock(rawText);

  // Step B: Create New Issue in Database
  const newIssue = await Issue.create({
    title: aiResult.issueSummary,
    description: `Root Concept: ${aiResult.rootCauseConcept}\nSuggested Action:${aiResult.suggestedAction}`,
    logs: rawText,
    status: "open",
    learningHints: [aiResult.learningHint],
  });

  // Step C: Save Log Linked to this Issue
  await Log.create({
    issueId: newIssue._id,
    rawText,
    source,
  });

  // Step D: Realtime Broadcast via Socket.IO to React Dashboard
  try {
    const io = getIO();
    io.emit("issue:created", newIssue);
  } catch (err) {
    console.log("Socket notification skipped (Socket server not attached yet)");
  }

  return res.status(201).json(new ApiResponse(201, newIssue, "Issue ingested and created successfully"));
});

// 2. Get All Pending / Open Issues for Dashboard
export const getPendingIssues = asyncHandler(async (req: Request, res: Response) => {
  const issues = await Issue.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, issues, "Issues fetched successfully"));
});

// 3. Update / Edit Issue Details (Admin Review)
export const updateIssue = asyncHandler(async (req: Request, res: Response) => {
  const { issueId } = req.params;
  const { title, description, status, learningHints } = req.body;

  const updatedIssue = await Issue.findByIdAndUpdate(
    issueId,
    { title, description, status, learningHints },
    { new: true, runValidators: true }
  );

  if (!updatedIssue) {
    return res.status(404).json(new ApiResponse(404, null, "Issue not found"));
  }

  return res.status(200).json(new ApiResponse(200, updatedIssue, "Issue updated successfully"));
});

// 4. Single-Click Push Issue to Official GitHub Repository
export const pushToGitHub = asyncHandler(async (req: Request, res: Response) => {
  const { issueId } = req.params;

  const issue = await Issue.findById(issueId);
  if (!issue) {
    return res.status(404).json(new ApiResponse(404, null, "Issue not found"));
  }

  // Format issue body with AI learning hints
  const githubBody = `### Description\n${issue.description}\n\n### Learning Hints\n${issue.learningHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n\n### Raw Logs\n\`\`\`\n${issue.logs}\n\`\`\``;

  // Call GitHub Service
  const githubResult = await createGitHubIssue({
    title: issue.title,
    body: githubBody,
  });

  // Update DB Issue with GitHub URL and Status
  issue.githubIssueUrl = githubResult.issueUrl;
  issue.status = "in-progress";
  await issue.save();

  return res.status(200).json(new ApiResponse(200, issue, "Issue published to GitHub successfully"));
});
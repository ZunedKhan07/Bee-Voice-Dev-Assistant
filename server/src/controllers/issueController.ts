import mongoose from "mongoose";
import { emitEvent } from "../config/socket.js";
import { Issue } from "../models/Issue.js";
import { analyzeIssue } from "../services/bedrockService.js";
import { createGithubIssue } from "../services/githubService.js";
import { ApiError, cleanText, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeLog } from "../utils/logParser.js";

const SEVERITIES = ["low", "medium", "high"];

// The raw transcript stays on the server.
const toClient = (doc: { toObject: () => unknown }): Record<string, unknown> => {
  const obj = doc.toObject() as Record<string, unknown>;
  delete obj.transcript;
  delete obj.__v;
  return obj;
};

const readList = (value: unknown, maxItems: number, maxLen: number): string[] | undefined =>
  Array.isArray(value) ? value.map((v) => cleanText(v, maxLen)).filter(Boolean).slice(0, maxItems) : undefined;

interface BodyFields {
  summary: string;
  rootCause: string;
  suggestedFix: string;
  severity: string;
  techStack: string[];
  reproductionSteps: string[];
}

const section = (heading: string, content: string): string => (content ? `## ${heading}\n${content}\n` : "");

const buildBody = (i: BodyFields): string =>
  [
    section("Summary", i.summary),
    section("Root cause", i.rootCause),
    i.reproductionSteps.length
      ? section("Reproduction steps", i.reproductionSteps.map((s, n) => `${n + 1}. ${s}`).join("\n"))
      : "",
    section("Suggested fix", i.suggestedFix),
    `**Severity:** ${i.severity}` + (i.techStack.length ? `  \n**Tech stack:** ${i.techStack.join(", ")}` : ""),
    "---\n_Created with Bee Voice-Dev Assistant_",
  ]
    .filter(Boolean)
    .join("\n");

// POST /api/issues/analyze: transcript or log in, structured draft out.
export const analyze = asyncHandler(async (req, res) => {
  const transcript = sanitizeLog(cleanText(req.body?.transcript, 30000), 12000);
  if (transcript.length < 10) {
    throw new ApiError(400, "Describe the bug or paste an error log (at least 10 characters).");
  }
  const draft = await analyzeIssue(transcript);
  const issue = await Issue.create({ ...draft, transcript, status: "draft" });
  sendSuccess(res, toClient(issue), "Issue draft generated", 201);
});

// POST /api/issues/push-github: apply the user's edits, publish, mark as pushed.
export const pushGithub = asyncHandler(async (req, res) => {
  const id = cleanText(req.body?.id, 40);
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "A valid issue id is required");

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, "Draft not found. Please generate the issue again.");
  if (issue.status === "pushed") throw new ApiError(409, "This issue is already on GitHub");

  const edits: Record<string, unknown> = {};
  const title = cleanText(req.body?.title, 200);
  if (title) edits.title = title;
  const summary = cleanText(req.body?.summary, 4000);
  if (summary) edits.summary = summary;
  if (typeof req.body?.rootCause === "string") edits.rootCause = cleanText(req.body.rootCause, 2000);
  if (typeof req.body?.suggestedFix === "string") edits.suggestedFix = cleanText(req.body.suggestedFix, 3000);
  if (SEVERITIES.includes(req.body?.severity)) edits.severity = req.body.severity;
  const techStack = readList(req.body?.techStack, 8, 30);
  if (techStack) edits.techStack = techStack;
  const steps = readList(req.body?.reproductionSteps, 15, 500);
  if (steps) edits.reproductionSteps = steps;
  issue.set(edits);

  const created = await createGithubIssue(issue.title, buildBody(issue), [
    "bee-voice-dev",
    `severity:${issue.severity}`,
  ]);
  issue.set({ status: "pushed", githubIssueUrl: created.url, githubIssueNumber: created.number });
  await issue.save();

  const payload = toClient(issue);
  emitEvent("issue:pushed", payload);
  sendSuccess(res, payload, "Issue created on GitHub");
});

// GET /api/issues/open: everything already published.
export const getOpenIssues = asyncHandler(async (_req, res) => {
  const issues = await Issue.find({ status: "pushed" })
    .select("-transcript -__v")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  sendSuccess(res, issues);
});

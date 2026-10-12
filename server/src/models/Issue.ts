import { Schema, model } from "mongoose";

const issueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, required: true },
    rootCause: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    suggestedFix: { type: String, default: "" },
    reproductionSteps: { type: [String], default: [] },
    transcript: { type: String, default: "" },
    status: { type: String, enum: ["draft", "pushed"], default: "draft" },
    githubIssueUrl: { type: String, default: "" },
    githubIssueNumber: { type: Number },
  },
  { timestamps: true }
);

issueSchema.index({ status: 1, createdAt: -1 });

export const Issue = model("Issue", issueSchema);

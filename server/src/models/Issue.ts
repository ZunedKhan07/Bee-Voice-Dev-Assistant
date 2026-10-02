import mongoose, { Schema, Document } from "mongoose";

export interface IIssue extends Document {
  title: string;
  description: string;
  logs?: string;
  status: "open" | "in-progress" | "resolved";
  learningHints: string[];
  githubIssueUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Issue description is required"],
    },
    logs: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    learningHints: [
      {
        type: String,
      },
    ],
    githubIssueUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Issue = mongoose.model<IIssue>("Issue", IssueSchema);
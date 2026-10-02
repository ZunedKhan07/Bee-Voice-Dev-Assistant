import mongoose, { Schema, Document } from "mongoose";

export interface ILog extends Document {
  issueId?: mongoose.Types.ObjectId;
  rawText: string;
  source: "voice" | "terminal" | "text";
  transcriptConfidence?: number;
  createdAt: Date;
}

const LogSchema: Schema = new Schema(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
    rawText: {
      type: String,
      required: [true, "Log text or transcript is required"],
    },
    source: {
      type: String,
      enum: ["voice", "terminal", "text"],
      default: "text",
    },
    transcriptConfidence: {
      type: Number,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

export const Log = mongoose.model<ILog>("Log", LogSchema);
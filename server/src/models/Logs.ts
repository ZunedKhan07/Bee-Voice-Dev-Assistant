import { Schema, model } from "mongoose";

const logSchema = new Schema(
  {
    sessionId: { type: String, default: "", index: true },
    source: { type: String, enum: ["transcript", "terminal", "mentor"], required: true },
    content: { type: String, required: true },
    issue: { type: Schema.Types.ObjectId, ref: "Issue" },
  },
  { timestamps: true }
);

export const Log = model("Log", logSchema);

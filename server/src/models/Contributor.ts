import { Schema, model } from "mongoose";

const contributorSchema = new Schema(
  {
    githubId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    profileUrl: { type: String, default: "" },
    contributions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Contributor = model("Contributor", contributorSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IContributor extends Document {
  githubUsername: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  issuesResolvedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContributorSchema: Schema = new Schema(
  {
    githubUsername: {
      type: String,
      required: [true, "GitHub username is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    profileUrl: {
      type: String,
      required: [true, "GitHub profile URL is required"],
    },
    issuesResolvedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Contributor = mongoose.model<IContributor>("Contributor", ContributorSchema);
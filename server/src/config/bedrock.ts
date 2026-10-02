import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
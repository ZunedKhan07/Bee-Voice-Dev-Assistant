import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

let client: BedrockRuntimeClient | null = null;

// Credentials are picked up automatically from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
// (or from your `aws configure` profile).
export const getBedrockClient = (): BedrockRuntimeClient => {
  if (!client) {
    client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
  }
  return client;
};

export const getModelId = (): string =>
  process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

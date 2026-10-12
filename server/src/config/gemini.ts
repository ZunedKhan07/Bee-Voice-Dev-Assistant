import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIClient: GoogleGenerativeAI | null = null;

export const getGeminiClient = (): GoogleGenerativeAI => {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY missing in environment variables!");
    }
    genAIClient = new GoogleGenerativeAI(apiKey || "");
  }
  return genAIClient;
};

export const getGeminiModelId = (): string =>
  process.env.GEMINI_MODEL_ID || "gemini-3-flash-preview";
import { ConverseCommand, ConverseStreamCommand, type Message } from "@aws-sdk/client-bedrock-runtime";
import { getBedrockClient, getModelId } from "../config/bedrock.js";
import { getGeminiClient, getGeminiModelId } from "../config/gemini.js";
import { ApiError } from "../utils/apiResponse.js";
import { ISSUE_SYSTEM_PROMPT, MENTOR_SYSTEM_PROMPT } from "../utils/bedrockPrompts.js";

export type Severity = "low" | "medium" | "high";

export interface IssueDraft {
  title: string;
  summary: string;
  rootCause: string;
  techStack: string[];
  severity: Severity;
  suggestedFix: string;
  reproductionSteps: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const toApiError = (err: unknown): ApiError => {
  if (err instanceof ApiError) return err;
  const name = err instanceof Error ? err.name : "";
  const msg = err instanceof Error ? err.message : "Unknown error";
  if (name === "AccessDeniedException") {
    return new ApiError(502, "Bedrock access denied. Enable model access in the AWS console and check IAM permissions.");
  }
  if (name === "ThrottlingException") {
    return new ApiError(429, "Bedrock is busy right now. Please try again in a moment.");
  }
  if (name === "ValidationException" || name === "ResourceNotFoundException") {
    return new ApiError(502, `Bedrock rejected the request. Check BEDROCK_MODEL_ID and AWS_REGION. (${msg})`);
  }
  return new ApiError(502, `Bedrock request failed: ${msg}`);
};

const parseJson = (raw: string): Record<string, unknown> => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) throw new ApiError(502, "AI did not return valid JSON, please retry");
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    throw new ApiError(502, "AI returned malformed JSON, please retry");
  }
};

const toStrings = (value: unknown, limit: number): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim()).slice(0, limit)
    : [];

const toText = (value: unknown, fallback: string, max: number): string =>
  (typeof value === "string" && value.trim() ? value.trim() : fallback).slice(0, max);

// --- GEMINI FALLBACK USING YOUR CONFIG ---
const analyzeWithGemini = async (transcript: string): Promise<Record<string, unknown>> => {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ 
    model: getGeminiModelId(),
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `${ISSUE_SYSTEM_PROMPT}\n\nDeveloper input:\n${transcript}`;
  const result = await model.generateContent(prompt);
  return parseJson(result.response.text());
};

export const analyzeIssue = async (transcript: string): Promise<IssueDraft> => {
  let raw: string = "";
  let data: Record<string, unknown>;

  try {
    // 1st Try: AWS Bedrock
    const res = await getBedrockClient().send(
      new ConverseCommand({
        modelId: getModelId(),
        system: [{ text: ISSUE_SYSTEM_PROMPT }],
        messages: [{ role: "user", content: [{ text: `Developer input:\n${transcript}` }] }],
        inferenceConfig: { maxTokens: 1400, temperature: 0.2 },
      })
    );
    const blocks = res.output?.message?.content ?? [];
    raw = blocks.map((b) => ("text" in b && b.text ? b.text : "")).join("").trim();
    data = parseJson(raw);
  } catch (err) {
    console.warn("⚠️ Bedrock failed, switching to Gemini Fallback...", err);
    try {
      // 2nd Try: Gemini Fallback using your config
      data = await analyzeWithGemini(transcript);
    } catch (geminiErr) {
      console.error("❌ Gemini Fallback failed too:", geminiErr);
      throw new ApiError(502, `AI processing failed. Gemini Error: ${geminiErr instanceof Error ? geminiErr.message : "Unknown error"}`);
    }
  }

  const severity = ["low", "medium", "high"].includes(String(data.severity)) ? (data.severity as Severity) : "medium";
  return {
    title: toText(data.title, "Untitled issue", 120),
    summary: toText(data.summary, transcript, 4000),
    rootCause: toText(data.rootCause, "", 2000),
    techStack: toStrings(data.techStack, 6),
    severity,
    suggestedFix: toText(data.suggestedFix, "", 3000),
    reproductionSteps: toStrings(data.reproductionSteps, 10),
  };
};

export const normalizeChat = (value: unknown): ChatMessage[] => {
  if (!Array.isArray(value)) return [];
  const cleaned: ChatMessage[] = value
    .filter(
      (m) =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim() !== ""
    )
    .slice(-12)
    .map((m) => ({ role: m.role as ChatMessage["role"], content: String(m.content).trim().slice(0, 4000) }));

  const merged: ChatMessage[] = [];
  for (const m of cleaned) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else merged.push({ ...m });
  }
  while (merged.length && merged[0].role !== "user") merged.shift();
  while (merged.length && merged[merged.length - 1].role !== "user") merged.pop();
  return merged;
};

export const streamMentorReply = async (
  messages: ChatMessage[],
  errorLog: string,
  onToken: (token: string) => void,
  signal: AbortSignal
): Promise<void> => {
  const bedrockMessages: Message[] = messages.map((m, i) => ({
    role: m.role,
    content: [
      {
        text:
          i === messages.length - 1 && errorLog
            ? `Error log shared by the developer:\n\`\`\`\n${errorLog}\n\`\`\`\n\n${m.content}`
            : m.content,
      },
    ],
  }));

  try {
    // 1st Try: Bedrock Streaming
    const res = await getBedrockClient().send(
      new ConverseStreamCommand({
        modelId: getModelId(),
        system: [{ text: MENTOR_SYSTEM_PROMPT }],
        messages: bedrockMessages,
        inferenceConfig: { maxTokens: 1500, temperature: 0.4 },
      }),
      { abortSignal: signal }
    );
    for await (const event of res.stream ?? []) {
      const text = event.contentBlockDelta?.delta?.text;
      if (text) onToken(text);
    }
  } catch (err) {
    console.warn("⚠️ Bedrock stream failed, switching to Gemini Streaming Fallback...", err);
    
    // 2nd Try: Gemini Streaming using your config
    try {
      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: getGeminiModelId() });

      const chatHistory = messages.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const chat = model.startChat({
        history: chatHistory,
        systemInstruction: MENTOR_SYSTEM_PROMPT
      });

      const lastMsg = messages[messages.length - 1];
      const finalPrompt = errorLog && lastMsg 
        ? `Error log shared by the developer:\n\`\`\`\n${errorLog}\n\`\`\`\n\n${lastMsg.content}`
        : lastMsg?.content || "";

      const result = await chat.sendMessageStream(finalPrompt);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) onToken(chunkText);
      }
    } catch (geminiErr) {
      console.error("❌ Gemini Streaming failed too:", geminiErr);
      throw toApiError(err);
    }
  }
};
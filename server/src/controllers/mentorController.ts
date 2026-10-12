import { normalizeChat, streamMentorReply } from "../services/bedrockService.js";
import { ApiError, cleanText } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeLog } from "../utils/logParser.js";

// POST /api/mentor/ask: multi-turn chat, answer streamed as Server-Sent Events.
export const ask = asyncHandler(async (req, res) => {
  const messages = normalizeChat(req.body?.messages);
  if (messages.length === 0) throw new ApiError(400, "Send at least one user message");
  const errorLog = sanitizeLog(cleanText(req.body?.errorLog, 20000), 8000);

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const controller = new AbortController();
  res.on("close", () => controller.abort());

  try {
    await streamMentorReply(
      messages,
      errorLog,
      (token) => res.write(`data: ${JSON.stringify({ token })}\n\n`),
      controller.signal
    );
    res.write("data: [DONE]\n\n");
  } catch (err) {
    if (!controller.signal.aborted) {
      const message = err instanceof Error ? err.message : "Mentor request failed";
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    }
  } finally {
    res.end();
  }
});

// Text-only context extraction (no screenshots, no browser automation).
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;

export interface ErrorContext {
  cleanedLog: string;
  errorType: string | null;
  files: string[];
}

export const extractErrorContext = (rawLog = ""): ErrorContext => {
  const cleaned = rawLog.replace(ANSI, "").replace(/\r/g, "").trim();
  // Keep the tail: the most useful part of a stack trace is usually at the end.
  const cleanedLog = cleaned.length > 6000 ? cleaned.slice(-6000) : cleaned;
  const typeMatch = cleanedLog.match(/\b([A-Z][A-Za-z]*(?:Error|Exception))\b/);
  const fileMatches = cleanedLog.match(/[\w@./\\-]+\.(?:tsx?|jsx?|py|java|go|rs|json):\d+(?::\d+)?/g) ?? [];
  return {
    cleanedLog,
    errorType: typeMatch ? typeMatch[1] : null,
    files: Array.from(new Set(fileMatches)).slice(0, 5),
  };
};

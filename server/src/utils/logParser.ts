const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;

// Remove terminal colour codes and keep the tail: the end of a stack trace is the most useful part.
export const sanitizeLog = (raw: string, max = 12000): string => {
  const cleaned = raw.replace(ANSI, "").replace(/\r/g, "").trim();
  return cleaned.length > max ? cleaned.slice(-max) : cleaned;
};

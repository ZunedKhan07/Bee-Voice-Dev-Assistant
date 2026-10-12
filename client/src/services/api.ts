import axios from "axios";
import type { Issue, Severity } from "../types";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";

const http = axios.create({ baseURL: API_URL, timeout: 60000 });

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const errMsg = (e: unknown): string => {
  if (axios.isAxiosError(e)) {
    if (!e.response) return "Cannot reach the server. Check that the backend is running.";
    return (e.response.data as { message?: string } | undefined)?.message ?? e.message;
  }
  return e instanceof Error ? e.message : "Something went wrong";
};

export interface PushPayload {
  id: string;
  title: string;
  summary: string;
  rootCause: string;
  techStack: string[];
  severity: Severity;
  suggestedFix: string;
  reproductionSteps: string[];
}

export interface MentorRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  errorLog: string;
}

export const api = {
  analyze: async (transcript: string) =>
    (await http.post<Envelope<Issue>>("/issues/analyze", { transcript })).data.data,

  pushIssue: async (payload: PushPayload) =>
    (await http.post<Envelope<Issue>>("/issues/push-github", payload)).data.data,

  openIssues: async () => (await http.get<Envelope<Issue[]>>("/issues/open")).data.data,

  // The mentor answer arrives as Server-Sent Events: `data: {"token": "..."}` lines, then `data: [DONE]`.
  streamMentor: async (
    body: MentorRequest,
    onToken: (token: string) => void,
    signal: AbortSignal
  ): Promise<void> => {
    const res = await fetch(`${API_URL}/mentor/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok || !res.body) {
      let message = `Request failed (${res.status})`;
      try {
        const json = (await res.json()) as { message?: string };
        if (json.message) message = json.message;
      } catch {
        /* keep the default message */
      }
      throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const raw of events) {
        const line = raw.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;

        let evt: { token?: string; error?: string } = {};
        try {
          evt = JSON.parse(payload) as { token?: string; error?: string };
        } catch {
          continue;
        }
        if (evt.error) throw new Error(evt.error);
        if (evt.token) onToken(evt.token);
      }
    }
  },
};

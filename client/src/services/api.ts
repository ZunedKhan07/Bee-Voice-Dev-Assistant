import axios from "axios";

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Issue {
  _id: string;
  title: string;
  description: string;
  logs: string;
  status: "open" | "in-progress" | "resolved";
  learningHints: string[];
  githubIssueUrl?: string;
  createdAt: string;
}

export interface AIResponse {
  issueSummary: string;
  rootCauseConcept: string;
  learningHint: string;
  suggestedAction: string;
}

// Ingest Log / Voice Text
export const ingestLog = async (rawText: string, source: string = "text") => {
  const response = await api.post("/issues/ingest", { rawText, source });
  return response.data;
};

// Fetch Pending Issues
export const getPendingIssues = async (): Promise<{ data: Issue[] }> => {
  const response = await api.get("/issues/pending");
  return response.data;
};

// Update Issue
export const updateIssue = async (issueId: string, payload: Partial<Issue>) => {
  const response = await api.put(`/issues/${issueId}`, payload);
  return response.data;
};

// Push to GitHub
export const pushToGitHub = async (issueId: string) => {
  const response = await api.post(`/issues/${issueId}/push`);
  return response.data;
};

// Verify Admin Auth
export const verifyAdmin = async (password: string) => {
  const response = await api.post("/auth/verify", { password });
  return response.data;
};

// Ask AI Mentor
export const askMentor = async (query: string, context?: string): Promise<{ data: AIResponse }> => {
  const response = await api.post("/mentor/ask", { query, context });
  return response.data;
};

export default api;
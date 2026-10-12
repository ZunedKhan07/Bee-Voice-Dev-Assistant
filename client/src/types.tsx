export type Severity = "low" | "medium" | "high";

export interface Issue {
  _id: string;
  title: string;
  summary: string;
  rootCause: string;
  techStack: string[];
  severity: Severity;
  suggestedFix: string;
  reproductionSteps: string[];
  status: "draft" | "pushed";
  githubIssueUrl?: string;
  githubIssueNumber?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

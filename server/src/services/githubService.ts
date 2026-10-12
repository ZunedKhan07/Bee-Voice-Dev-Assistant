import { ApiError } from "../utils/apiResponse.js";

export const createGithubIssue = async (
  title: string,
  body: string,
  labels: string[] = []
): Promise<{ url: string; number: number }> => {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) {
    throw new ApiError(500, "GitHub is not configured. Set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO in .env");
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "bee-voice-dev-assistant",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body, labels }),
  });

  if (!res.ok) {
    const hint = res.status === 401 || res.status === 403 ? " Check that GITHUB_TOKEN can write issues." : "";
    throw new ApiError(502, `GitHub returned ${res.status}.${hint}`);
  }
  const data = (await res.json()) as { html_url: string; number: number };
  return { url: data.html_url, number: data.number };
};

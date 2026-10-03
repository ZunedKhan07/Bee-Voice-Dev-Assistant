import dotenv from "dotenv";

dotenv.config();

interface CreateGitHubIssueInput {
  title: string;
  body: string;
  labels?: string[];
}

export const createGitHubIssue = async ({
  title,
  body,
  labels = ["bug", "bee-voice-dev"],
}: CreateGitHubIssueInput) => {
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const token = process.env.GITHUB_TOKEN;

  if (!repoOwner || !repoName || !token) {
    throw new Error("GitHub environment variables (OWNER, REPO, TOKEN) are missing in .env");
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Return created GitHub issue HTML URL
    return {
      issueUrl: data.html_url,
      issueNumber: data.number,
    };
  } catch (error) {
    console.error("Failed to create issue on GitHub:", error);
    throw error;
  }
};
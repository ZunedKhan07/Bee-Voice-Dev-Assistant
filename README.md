# 🐝 Bee Voice-Dev Assistant

**Voice-First AI Developer Assistant | Bee Agent Framework | Amazon Bedrock | GitHub Issue Automation**

Bee Voice-Dev Assistant is a voice-first AI-powered developer tool that helps developers report bugs in open-source projects, convert unstructured voice descriptions into structured GitHub issues, and learn debugging through Socratic AI guidance.

Built for the **Amazon Developer Hackathon — Bee Track & AWS Builder Mini Challenge**, the project aims to reduce the friction of bug reporting while keeping developers in control of reviewing and publishing issues.

---

## 🎯 The Problem

Open-source developers, students, and software engineers frequently encounter bugs, UI glitches, and unexpected runtime errors while working with codebases.

However, reporting these issues often requires several manual steps:

1. Stop the current development workflow.
2. Open GitHub and navigate to the target repository.
3. Write a clear issue title and description.
4. Collect error logs and document reproduction steps.
5. Submit the issue and return to development.

This friction can lead to poorly documented issues or bugs that never get reported.

**Bee Voice-Dev Assistant simplifies this process through voice input, AI-assisted issue generation, and a human-approved GitHub publishing workflow.**

## ✨ Key Features

### 🎙️ Voice-Activated Bug Reporting
- Describe bugs and unexpected behavior using your microphone.
- Convert speech into text using the browser's Web Speech API.
- Capture relevant error messages and debugging context.

### 🐝 AI-Powered Issue Generation
- Transform unstructured bug descriptions into structured issue drafts.
- Generate clear issue titles and detailed descriptions.
- Organize reproduction steps, severity, suspected causes, and possible debugging approaches.
- Use the Bee Agent Framework to orchestrate the workflow when configured.

### ✏️ Interactive Issue Editor
- Review AI-generated issue drafts before publishing.
- Edit titles, descriptions, and reproduction steps.
- Keep the developer in control of the final submission.

### 🐙 GitHub Issue Automation
- Integrate with the GitHub REST API.
- Publish approved issue drafts to a configured repository.
- Keep GitHub credentials on the backend rather than exposing them in the frontend.

### 💬 Socratic AI Developer Mentor
- Receive conceptual explanations and debugging hints.
- Understand potential causes instead of relying only on copy-paste solutions.
- Get relevant documentation links and suggestions for investigating problems independently.

### ⚡ Real-Time Agent Updates
- Use Socket.IO for real-time communication between the frontend and backend.
- Display agent execution events and workflow progress.

### 🔐 Secure Configuration
- Store API credentials and environment-specific settings in backend environment variables.
- Keep AWS and GitHub secrets out of client-side code.
- Review permissions and configuration before enabling issue publishing.

---

## 🐝 Bee Agent Framework Integration

The project is designed around the **Bee Agent Framework** (`@i-am-bee/bee-agent-framework`) for agent orchestration.

The intended agent workflow includes:

- **Context Processing:** Interpret voice transcripts, error messages, and developer-provided context.
- **Tool Calling:** Connect agent reasoning to issue structuring and GitHub API operations.
- **Workflow Orchestration:** Coordinate issue generation, validation, review, and publishing.
- **Developer Guidance:** Provide debugging explanations and follow-up questions when more context is needed.

The framework's actual tools, skills, memory, and execution flow depend on the implementation in the backend.

## 🏗️ System Architecture

```text
┌───────────────────────────────────────┐
│           Developer Voice Input       │
│       Browser Speech Recognition      │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│             React Frontend            │
│       Voice UI and Issue Editor       │
└───────────────────┬───────────────────┘
                    │ HTTP / Socket.IO
                    ▼
┌───────────────────────────────────────┐
│        Node.js / Express Backend      │
│                                       │
│       Bee Agent Framework Layer       │
│       Agent Tools and Workflows       │
└──────────┬────────────┬───────────────┘
           │            │
           ▼            ▼
┌─────────────────┐  ┌──────────────────┐
│ Amazon Bedrock  │  │  GitHub REST API │
│  AI Model       │  │  Issue Creation  │
└─────────────────┘  └──────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│        MongoDB / Mongoose             │
│   Application Data (if configured)    │
└───────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Agent Framework | Bee Agent Framework |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Voice Input | Browser Web Speech API |
| Backend | Node.js, Express.js, TypeScript |
| Real-Time Communication | Socket.IO |
| AI Integration | Amazon Bedrock Runtime SDK |
| AI Model | Supported Amazon Bedrock model |
| Database | MongoDB, Mongoose |
| Issue Management | GitHub REST API |

*The table describes the intended stack. Verify each integration against the current source code before presenting it as implemented.*

## ⚙️ Prerequisites

Before running the project, ensure you have:

- Node.js 18 or a compatible version required by the installed dependencies.
- npm.
- A MongoDB instance, if database features are enabled.
- AWS credentials and access to an enabled Amazon Bedrock model, if using Bedrock.
- A GitHub token with the minimum required permissions to create issues in the target repository.
- Bee Agent Framework configured in the backend.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bee-voice-dev-assistant
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your actual repository URL.

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bee-voice-dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_target_repository
```

Use only the environment variables required by your implementation. Never commit `.env` files or real credentials to GitHub.

For AWS, prefer an appropriate IAM role or temporary credentials over long-lived access keys whenever possible.

Start the backend using the script defined in `server/package.json`. If the project provides a `dev` script:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, commonly:

`http://localhost:5173`

### 4. Configure the Integrations

Before testing the complete workflow:

1. Confirm that the Bee Agent Framework is installed and imported by the backend.
2. Configure the required AWS Bedrock model access.
3. Verify MongoDB connectivity if database features are enabled.
4. Configure GitHub authentication and repository permissions.
5. Test voice transcription, issue generation, editing, and publishing separately.

*The commands and environment variables may need adjustment to match the actual repository structure and package scripts.*

## 🔄 How It Works

1. **Capture:** The developer describes a bug or unexpected behavior using voice input.
2. **Transcribe:** Browser speech recognition converts the voice input into text.
3. **Analyze:** The backend processes the transcript and any supplied error logs.
4. **Generate:** The AI workflow creates a structured GitHub issue draft.
5. **Review:** The developer checks and edits the generated content.
6. **Publish:** After explicit approval, the backend submits the issue to GitHub.
7. **Learn:** The developer can ask follow-up questions and receive debugging guidance.

## 🔒 Security and Human Oversight

- GitHub issue creation requires developer approval.
- API credentials must remain on the backend.
- Repository access should be restricted to the minimum necessary permissions.
- Generated issue content should be reviewed for accuracy, sensitive data, and accidental disclosure of secrets.
- AI-generated root causes and suggested fixes are hypotheses, not guaranteed diagnoses.

## 🏆 Hackathon Alignment

### 🐝 Bee Track
Uses the Bee Agent Framework as the intended orchestration layer for a developer-focused agent workflow. The final implementation should demonstrate actual framework usage, tool integration, and agent execution.

### ☁️ AWS Builder Mini Challenge
Uses Amazon Bedrock as the intended AI inference service for issue analysis and developer guidance, subject to the configured model and working integration.

### 🌍 Open Source Impact
Makes bug reporting more accessible by helping developers produce clearer, more actionable issues without interrupting their workflow for lengthy manual documentation.

## 🔮 Future Improvements

- Support pasted terminal logs and screenshots.
- Detect duplicate issues before publishing.
- Suggest relevant repository files and documentation.
- Add multilingual voice input.
- Support multiple repositories with explicit authorization.
- Introduce configurable issue templates and labels.
- Improve error handling, automated tests, and deployment support.

## 👨‍💻 Author

**Juned Khan**

Full Stack Software Developer | AI Systems

- GitHub: [@ZunedKhan07](https://github.com/ZunedKhan07)
- Portfolio: [portf-o-jk.vercel.app](https://portf-o-jk.vercel.app)

---

**Bee Voice-Dev Assistant — Speak the bug. Structure the issue. Learn to debug.**

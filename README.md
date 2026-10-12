# 🐝 Bee Voice-Dev Assistant

> **Voice-First AI Developer Ecosystem & Automated GitHub Issue Pipeline**  
> Built for the Amazon Developer Hackathon — Bee Track & AWS Builder Mini Challenge.

Bee Voice-Dev Assistant helps developers report bugs in open-source projects using voice, convert unstructured observations into actionable GitHub issues, and learn through AI-guided debugging.

## 🎯 Philosophy & The Core Problem

When open-source developers, students, and early-career software engineers explore repositories or work on codebases, they frequently encounter bugs, visual glitches, and unexpected runtime errors.

Reporting these issues manually can interrupt their workflow:

1. Stop development or debugging.
2. Open GitHub and navigate to the target repository.
3. Write a clear issue title and description.
4. Collect logs and document reproduction steps.
5. Submit the issue and return to development.

This friction can lead to unreported bugs and incomplete issue reports.

### 💡 Why Voice-to-Issue Instead of Automated Pull Requests?

Many AI coding tools attempt to generate code changes or pull requests automatically. Bee Voice-Dev Assistant focuses on simplifying the reporting process while keeping developers responsible for investigating and solving the underlying problems.

**Our philosophy:** AI should reduce repetitive work without replacing the learning experience of software development.

The assistant automates voice-based bug reporting, structures issue descriptions, and provides debugging guidance. Developers remain in control of the final issue submission and subsequent implementation.

## ✨ Key Features

- **🎙️ Voice-Activated Issue Reporting:** Capture bug descriptions, terminal errors, and unexpected behavior through microphone input using the browser's Web Speech API.
- **🧠 AI-Powered Issue Analysis:** Uses AWS Bedrock with a supported Claude model to transform transcripts and stack traces into structured issue drafts, including titles, severity, reproduction steps, suspected causes, and suggested fixes.
- **✏️ Interactive Issue Editor:** Review and edit AI-generated issue details before publishing them to GitHub.
- **🐙 GitHub REST API Integration:** Publish approved issue drafts to supported GitHub repositories directly from the dashboard.
- **💬 Socratic AI Developer Mentor:** Get conceptual explanations, debugging hints, and relevant documentation links rather than relying exclusively on copy-paste solutions.
- **⚡ Real-Time Updates:** Uses Socket.IO to communicate live application events between the frontend and backend.
- **🔐 Environment-Based Configuration:** Keeps API credentials and sensitive configuration on the backend.

## 🏗️ Architecture & Tech Stack

### System Architecture

```text
┌──────────────────────────────┐
│       Developer              │
│  Voice Input / Bug Details   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      React Frontend          │
│  Speech Recognition + Editor │
└──────────────┬───────────────┘
               │ HTTP / Socket.IO
               ▼
┌──────────────────────────────┐
│    Node.js + Express API     │
│  Validation + Issue Workflow │
└───────┬──────────┬───────────┘
        │          │
        ▼          ▼
┌─────────────┐  ┌─────────────────┐
│ AWS Bedrock │  │ MongoDB         │
│ Claude AI   │  │ Mongoose        │
└─────────────┘  └─────────────────┘
        │
        ▼
┌──────────────────────────────┐
│       GitHub REST API         │
│   Create Approved Issues     │
└──────────────────────────────┘
```

### Frontend — `/client`

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide Icons, if configured
- **Real-Time Communication:** Socket.IO Client
- **Speech Recognition:** Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)

### Backend — `/server`

- **Runtime:** Node.js
- **Framework:** Express.js with TypeScript
- **AI Integration:** AWS Bedrock Runtime SDK (`@aws-sdk/client-bedrock-runtime`)
- **Database:** MongoDB with Mongoose
- **Real-Time Communication:** Socket.IO Server
- **Additional Utilities:** CORS, dotenv, and Playwright where required by the implemented features

## 📋 Prerequisites

Before running the application, make sure you have:

- Node.js 18 or a compatible version supported by your dependencies.
- npm.
- A MongoDB instance, either local or hosted on MongoDB Atlas.
- An AWS account with credentials and permission to invoke an available Amazon Bedrock model.
- A GitHub Personal Access Token with the required permissions to create issues in the target repository.

**Important:** Amazon Bedrock model availability and access requirements vary by AWS Region and model. Verify that your selected Claude model is available to your account before configuring the application.

## 🚀 Getting Started Locally

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bee-voice-dev-assistant
```

Replace the placeholder URL and directory name with your actual repository details.

### 2. Backend Setup

Open a terminal and navigate to the backend:

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bee-voice-dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_target_repository
```

Update the values according to your environment.

**AWS credentials:** For local development, you can use environment variables or a configured AWS credentials profile. For deployed applications, prefer IAM roles or another supported temporary-credential mechanism instead of long-lived access keys.

**GitHub configuration:** Set the owner and repository name to the repository where you are authorized to create issues. If your implementation supports selecting repositories dynamically, follow its actual configuration instead.

### 3. Configure the Backend Start Script

Check `server/package.json` to confirm that it contains a development script compatible with your project.

For example, if the project uses `tsx`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts"
  }
}
```

This is only an example. If your entry point is `index.ts`, `dist/index.js`, or another file, use the command appropriate for your actual project structure. Install the required development dependency if it is not already present.

Start the backend:

```bash
npm run dev
```

Keep this terminal running.

### 4. Frontend Setup

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite. The default is usually:

```text
http://localhost:5173
```

If your frontend uses an API base URL environment variable, configure it using the variable name expected by your existing code. Vite-exposed variables typically use the `VITE_` prefix.

### 5. Verify the Application

Before using the application, confirm that:

- The backend starts without errors.
- MongoDB connects successfully.
- AWS Bedrock can invoke the configured model.
- GitHub authentication and issue-creation permissions are valid.
- Browser speech recognition is supported and microphone permission is granted.
- The frontend can communicate with the backend.
- AI-generated issues can be reviewed before publishing.

## 🔄 How It Works

1. **Capture:** The developer describes a bug or provides relevant error details.
2. **Transcribe:** Browser speech recognition converts spoken input into text when supported.
3. **Analyze:** The backend sends relevant information to the configured AWS Bedrock model.
4. **Structure:** The AI produces an issue draft with a title, description, reproduction steps, severity, and debugging suggestions.
5. **Review:** The developer checks and edits the generated content.
6. **Publish:** After approval, the backend submits the issue through the GitHub REST API.
7. **Learn:** The Socratic AI mentor offers explanations and debugging guidance to support independent problem-solving.

## 🏆 Hackathon Track Alignment

### 🐝 Primary Track: Bee

Explores a voice-first developer workflow that reduces friction when reporting bugs and documenting software issues.

### ☁️ AWS Builder Mini Challenge

Uses Amazon Bedrock to support issue analysis, structured report generation, and AI-assisted developer guidance.

### 🌍 Open Source

Aims to make open-source bug reporting more accessible and help developers contribute better-quality issue reports.

*Track names and eligibility should match the official hackathon rules for the specific submission.*

## 🔒 Security & Privacy

- Never commit `.env` files or expose AWS and GitHub credentials in frontend code.
- Add `.env` and other local secret files to `.gitignore`.
- Validate and sanitize input before processing it or sending it to external services.
- Avoid submitting sensitive source code, private logs, or personal data to AI services without authorization.
- Require user confirmation before creating GitHub issues.
- Use the minimum permissions necessary for AWS and GitHub integrations.

## 🛣️ Future Improvements

Potential enhancements include:

- Repository-aware issue templates.
- Automatic collection of browser console errors and stack traces, with user permission.
- Duplicate issue detection.
- Support for additional speech recognition providers.
- Improved issue templates for different project types.
- Issue history and contribution analytics.
- Automated tests for API routes and GitHub integration.

These are potential enhancements and should not be considered implemented features unless they are already available in the project.

## 🧪 Testing

Run the test commands configured in each package's `package.json`.

For example, if a test script exists:

```bash
npm test
```

Run the command from the relevant project directory. Verify the actual test scripts before using this command.

## 📜 License

This project is intended to be distributed under the MIT License.

Include an MIT `LICENSE` file in the repository before claiming that the project is licensed under MIT.

## 👨‍💻 Author

**Juned Khan**

Full Stack Software Developer

- GitHub: [ZunedKhan07](https://github.com/ZunedKhan07)

---

*Built to reduce bug-reporting friction, support open-source contributors, and encourage independent software engineering skills.*

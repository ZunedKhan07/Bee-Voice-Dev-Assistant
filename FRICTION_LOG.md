# Friction Log - Bee Voice-Dev Assistant

### Task Attempted
Implementing streaming and structured JSON responses using the AWS Bedrock Converse API (`@aws-sdk/client-bedrock-runtime`) for issue analysis and Socratic AI mentoring, alongside a Gemini API fallback system.

### Steps Taken
1. Initialized `BedrockRuntimeClient` using `ConverseCommand` for structured JSON issue extraction and `ConverseStreamCommand` for real-time mentor streaming.
2. Configured custom system prompts demanding strict JSON payloads (Title, Reproduction Steps, Severity, Suggested Fixes).
3. Added API error handling for `AccessDeniedException`, `ThrottlingException`, and `ValidationException`, triggering an automated fallback to Gemini API (`@google/generative-ai`).

### Expected vs. Actual Result
- **Expected**: Clean JSON output directly from Bedrock `ConverseCommand` response blocks.
- **Actual**: Model responses occasionally wrapped valid JSON with conversational text or markdown code fences (```json ... ```), which caused `JSON.parse()` syntax errors on raw output.

### Severity Rating
Medium

### Workaround Used
Created a custom `parseJson` utility function on the backend using string index slicing (`raw.indexOf("{")` to `raw.lastIndexOf("}")`) to extract pure JSON blocks reliably before parsing, while maintaining automatic failover to Gemini API for high availability.

### Actionable Suggestion
Introduce native JSON response schema constraints or structured output settings directly in `ConverseCommand` inference configuration in the AWS Bedrock SDK to avoid manual string slicing wrappers.
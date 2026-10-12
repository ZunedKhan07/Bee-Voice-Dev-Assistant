import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { connect_DB, disconnectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import issueRoutes from "./routes/issueRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const warnAboutEnv = (): void => {
  const missing = ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"].filter((k) => !process.env[k]);
  if (missing.length) console.warn(`[env] GitHub publishing will fail until these are set: ${missing.join(", ")}`);
};

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: CLIENT_URLS }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Bee backend is running" });
});
app.use("/api/issues", issueRoutes);
app.use("/api/mentor", mentorRoutes);
app.use(notFound);
app.use(errorHandler);

const start = async (): Promise<void> => {
  warnAboutEnv();
  await connect_DB();
  const server = http.createServer(app);
  initSocket(server, CLIENT_URLS);
  server.listen(PORT, () => console.log(` 🚀 [server] http://localhost:${PORT}`));

  const shutdown = (): void => {
    console.log("[server] shutting down");
    server.close(() => {
      void disconnectDB().finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});

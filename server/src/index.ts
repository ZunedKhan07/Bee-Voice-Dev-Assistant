import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connect_DB from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Route Imports
import issueRoutes from "./routes/issueRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Create HTTP Server for Express + Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO Engine
initSocket(server);

// API Route Bindings
app.use("/api/issues", issueRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Bee Voice-Dev Assistant API is running smoothly!" });
});

// Start DB and Server
const startServer = async () => {
  try {
    await connect_DB();
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to DB connection issue:", error);
    process.exit(1);
  }
};

startServer();
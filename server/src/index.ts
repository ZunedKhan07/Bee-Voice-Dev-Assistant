import express from "express";
import dotenv from "dotenv";
import connect_DB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Basic Test Route
app.get("/", (req, res) => {
  res.send("Bee Voice-Dev Assistant Server is Running!");
});

// Connect DB and Start Server
connect_DB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to DB connection error:", err);
  });
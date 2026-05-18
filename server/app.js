import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { checkDbConnection, checkAdmin } from "./config/db.config.js";
import env from "./utils/env.js";
import router from "./routes/index.js";
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  }),
);

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

(async () => {
  const isConnected = await checkDbConnection();
  if (!isConnected) {
    console.warn("Database connection failed. Some features may not work, but server will continue to run.");
  }
};

startServer();

export default app;

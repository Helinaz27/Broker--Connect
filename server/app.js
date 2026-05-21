import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { checkDbConnection, checkAdmin } from "./config/db.config.js";
import env from "./utils/env.js";
import router from "./routes/index.js";
import { initSocket } from "./socket/socket.js";

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
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

const startServer = async () => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      console.error("Database connection failed.");
      process.exit(1);
    }
    await checkAdmin();

    initSocket(httpServer);

    const port = env.port || 5500;
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;

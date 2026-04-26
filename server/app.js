import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./utils/env.js";

const router = require("./routes/index");

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

// Health check
app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

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

// Start server
const startServer = async () => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      console.error("Database connection failed.");
      process.exit(1);
    }

    await checkAdmin();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      console.log(`Environment: ${env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;

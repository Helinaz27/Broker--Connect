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

// Start server
const startServer = async () => {
  try {
    const isConnected = await checkDbConnection();
    if (isConnected) {
      // Only check admin if connected
      // Note: checkDbConnection currently returns true even if it fails for dev purposes
      // but let's make it more robust here.
      try {
        await checkAdmin();
      } catch (adminError) {
        console.warn("Skipping admin check due to database error.");
      }
    }
    
    const port = env.port || 5500;
    app.listen(port, () => {
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

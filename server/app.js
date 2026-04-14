const express = require("express");
const dotenv = require("dotenv");
const { checkDbConnection, checkAdmin } = require("./config/db.config");
const router = require("./routes/index");
const cors = require("cors");
const app = express();

const envFile = ".env";
dotenv.config({ path: envFile });
const port = process.env.PORT || 5500;

const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/api", router);

(async () => {
  const isConnected = await checkDbConnection();
  if (!isConnected) {
    console.error("Database connection failed.");
    process.exit(1);
  }

  await checkAdmin();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

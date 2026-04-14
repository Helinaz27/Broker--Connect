const mongoose = require("mongoose");

const checkDbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};

const checkAdmin = async () => {
  console.log("Checking admin...");
  // your admin creation logic here
};

module.exports = {
  checkDbConnection,
  checkAdmin,
};

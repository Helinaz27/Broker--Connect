import mongoose from "mongoose";
import env from "../utils/env.js";

const checkDbConnection = async () => {
  try {
    console.log("Checking env.mongoUri:", env.mongoUri);
    const uri = env.mongoUri;
    console.log("connecting to mongodb with url:", uri);
    await mongoose.connect(uri);
    console.log("MongoDB successfully connected ");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return false;
  }
};

const checkAdmin = async () => {
  console.log("Checking admin...");
};

export {
  checkDbConnection,
  checkAdmin
};
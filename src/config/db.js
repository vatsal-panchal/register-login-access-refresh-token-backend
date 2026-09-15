import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(`DB connection fail || ${error.message}`);
  }
};


export default connectDB
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/node-express-backend";
    const connectionInstance = await mongoose.connect(mongoUri);
    console.log(`\n MongoDB connected! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;

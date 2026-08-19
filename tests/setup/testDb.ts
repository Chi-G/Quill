import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export const connectTestDb = async (): Promise<void> => {
  let uri = process.env.MONGODB_URI;
  if (uri && uri.trim() !== "") {
    if (uri.includes("clusterquill.qhfb9fo.mongodb.net")) {
      uri = uri.replace("/quill_cms?", "/quill_cms_test?");
    }
  } else {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: "6.0.14",
      },
    });
    uri = mongoServer.getUri();
  }
  await mongoose.connect(uri);
};

export const disconnectTestDb = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

export const clearTestDb = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

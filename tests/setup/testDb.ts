import mongoose from "mongoose";

const getTestUri = (): string => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quill_cms_test";
  if (uri.includes("clusterquill.qhfb9fo.mongodb.net")) {
    return uri.replace("/quill_cms?", "/quill_cms_test?");
  }
  return uri;
};

export const connectTestDb = async (): Promise<void> => {
  const testUri = getTestUri();
  await mongoose.connect(testUri);
};

export const disconnectTestDb = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
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

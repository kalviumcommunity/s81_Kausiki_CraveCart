const mongoose = require("mongoose");
require("dotenv").config();

const RETRY_DELAY_MS = 10000;
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/cravecart";

let isRetryScheduled = false;

const getMongoUris = () => {
  const primary = process.env.MONGODB_URI || process.env.mongodb;
  if (!primary) return [LOCAL_MONGO_URI];
  return [primary, LOCAL_MONGO_URI];
};

const shouldTryFallback = (error) => {
  if (!error) return false;
  const code = error.code || "";
  return code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT";
};

const scheduleRetry = () => {
  if (isRetryScheduled) return;
  isRetryScheduled = true;
  setTimeout(async () => {
    isRetryScheduled = false;
    await connectToDatabase();
  }, RETRY_DELAY_MS);
};

const connectToDatabase = async () => {
  const uris = getMongoUris();

  for (let i = 0; i < uris.length; i += 1) {
    const uri = uris[i];
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`MongoDB connected successfully: ${uri.includes("127.0.0.1") ? "local" : "remote"}`);

      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasMeals = collections.some((c) => c.name === "meals");
        if (hasMeals) {
          const indexes = await mongoose.connection.db.collection("meals").indexes();
          const uniqueIndex = indexes.find((idx) => idx.name === "kitchenId_1_date_1_mealType_1");
          if (uniqueIndex && uniqueIndex.unique) {
            await mongoose.connection.db.collection("meals").dropIndex("kitchenId_1_date_1_mealType_1");
            console.log("Successfully dropped legacy unique index 'kitchenId_1_date_1_mealType_1' on meals.");
          }
        }
      } catch (idxErr) {
        console.log("Legacy index check note:", idxErr.message);
      }

      return true;
    } catch (err) {
      console.error("MongoDB connection error:", err.message || err);

      const isLastUri = i === uris.length - 1;
      if (!isLastUri && shouldTryFallback(err)) {
        console.log("Retrying MongoDB using local fallback URI...");
        continue;
      }

      console.log(`Will retry MongoDB connection in ${RETRY_DELAY_MS / 1000} seconds...`);
      scheduleRetry();
      return false;
    }
  }

  scheduleRetry();
  return false;
};

const connection = connectToDatabase();

module.exports = connection;
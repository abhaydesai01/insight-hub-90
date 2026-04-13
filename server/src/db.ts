import mongoose from "mongoose";

export async function connectDb(uri: string) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(
      "MongoDB connection failed. Check MONGODB_URI in server/.env, VPN/network, and Atlas → Network Access (IP allowlist)."
    );
    throw err;
  }
}

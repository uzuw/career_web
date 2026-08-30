import mongoose from "mongoose";
import { env } from "../config/env";

let connected = false;

export async function connectDB(uri: string = env.mongoUri): Promise<typeof mongoose> {
  if (connected) return mongoose;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  connected = true;
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

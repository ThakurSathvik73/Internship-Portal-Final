import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_DIRECT_URI || process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {})
      .then((mongoose) => mongoose);
    // console.log('MongoDB Connected');
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

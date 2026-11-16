import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI as string;
    if (!rawUri) {
      console.warn("⚠️ MONGO_URI is not set!");
      return;
    }

    if (rawUri.includes("<YOUR_MONGODB_PASSWORD>") || rawUri.includes("password_here")) {
      console.error("❌ CRITICAL: MONGO_URI contains an unreplaced password placeholder!");
    }

    // Safely format URI if password has unencoded special characters
    let formattedUri = rawUri;
    try {
      if (rawUri.startsWith("mongodb+srv://") || rawUri.startsWith("mongodb://")) {
        const parts = rawUri.split("@");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const authPart = parts[0].replace(/^mongodb(\+srv)?:\/\//, "");
          const [user, ...pwdParts] = authPart.split(":");
          const pwd = pwdParts.join(":");
          if (user && pwd && !pwd.includes("%")) {
            const prefix = rawUri.startsWith("mongodb+srv://") ? "mongodb+srv://" : "mongodb://";
            formattedUri = `${prefix}${encodeURIComponent(decodeURIComponent(user))}:${encodeURIComponent(decodeURIComponent(pwd))}@${parts[1]}`;
          }
        }
      }
    } catch {
      formattedUri = rawUri;
    }

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error event:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Mongoose disconnected from MongoDB");
    });

    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected successfully");
    });

    await mongoose.connect(formattedUri, {
      dbName: process.env.DB_NAME || "Zomato_Clone",
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false, // Prevents queries from hanging for 10s if DB is not connected
    });

    console.log("connected to mongodb");
  } catch (error) {
    console.error("MongoDB connection error (auth):", error);
  }
};

export default connectDB;

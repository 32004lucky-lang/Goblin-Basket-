import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check — required by Render
app.get("/", (_req, res) => res.status(200).json({ status: "ok", service: "auth" }));

app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  connectDB();
});

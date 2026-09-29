import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.js";
import paymentRoutes from "./routes/payment.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();

connectRabbitMQ();

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

const hasRealCloudinaryKeys =
  CLOUD_NAME &&
  CLOUD_API_KEY &&
  CLOUD_SECRET_KEY &&
  !CLOUD_NAME.includes("your") &&
  !CLOUD_API_KEY.includes("your") &&
  !CLOUD_SECRET_KEY.includes("your");

if (hasRealCloudinaryKeys) {
  cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_SECRET_KEY,
  });
} else {
  console.log("⚠️  Cloudinary not configured — images will be stored as base64 data URIs.");
}

// Health check — required by Render
app.get("/", (_req, res) => res.status(200).json({ status: "ok", service: "utils" }));

app.use("/api", uploadRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Utils service is running on port ${PORT}`);
});

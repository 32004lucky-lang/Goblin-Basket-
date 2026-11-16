import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check — required by Render
app.get("/", (_req, res) => res.status(200).json({ status: "ok", service: "rider", uptime: process.uptime(), timestamp: new Date().toISOString() }));

app.use("/api/rider", riderRoutes);

app.listen(process.env.PORT, async () => {
  console.log(`Rider service is running on port ${process.env.PORT}`);
  await connectDB();
  connectRabbitMQ()
    .then(() => {
      startOrderReadyConsumer();
    })
    .catch((err) => {
      console.warn("⚠️ RabbitMQ not connected on startup:", err?.message || err);
    });
});

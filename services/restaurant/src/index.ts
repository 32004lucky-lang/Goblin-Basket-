import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaraunt.js";
import itemRoutes from "./routes/menuitem.js";
import cartRoutes from "./routes/cart.js";
import addressRoutes from "./routes/address.js";
import orderRoutes from "./routes/order.js";
import cors from "cors";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5001;

// Health check — required by Render
app.get("/", (_req, res) => res.status(200).json({ status: "ok", service: "restaurant", uptime: process.uptime(), timestamp: new Date().toISOString() }));

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

app.listen(PORT, async () => {
  console.log(`Restaurant service is running on port ${PORT}`);
  await connectDB();
  connectRabbitMQ()
    .then(() => {
      startPaymentConsumer();
    })
    .catch((err) => {
      console.warn("⚠️ RabbitMQ not connected on startup:", err?.message || err);
    });
});

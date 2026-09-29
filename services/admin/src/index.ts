import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check — required by Render
app.get("/", (_req, res) => res.status(200).json({ status: "ok", service: "admin" }));

app.use("/api/v1", adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Admin Service is running on port ${process.env.PORT}`);
});

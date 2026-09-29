import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;

    if (!buffer) {
      return res.status(400).json({ message: "No image buffer provided" });
    }

    const isPlaceholder =
      !process.env.CLOUD_NAME ||
      !process.env.CLOUD_API_KEY ||
      !process.env.CLOUD_SECRET_KEY ||
      process.env.CLOUD_NAME?.includes("your") ||
      process.env.CLOUD_API_KEY?.includes("your") ||
      process.env.CLOUD_SECRET_KEY?.includes("your");

    if (isPlaceholder) {
      // Return the base64 data URI directly so images actually display
      // buffer here is already a base64 data URI string from getBuffer()
      return res.json({
        url: buffer,
      });
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer, {
      resource_type: "auto",
    });

    res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;

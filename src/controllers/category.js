import { getDataUrl } from "../utils/buffer.js";
import cloudinary from "cloudinary";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required"
      });
    }

    const fileBuffer = getDataUrl(file);

    const cloud = await cloudinary.v2.uploader.upload(
      fileBuffer.content,
      {
        folder: "categories"
      }
    );

    res.status(200).json({
      status: "success",
      message: "Category added successfully",
      image: cloud.secure_url
    });

  } catch (error) {
    console.error("add category error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

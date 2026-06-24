import cloudinary from "cloudinary";
import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer temp storage
const upload = multer({ dest: "/tmp" });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  upload.single("file")(req as any, res as any, async (err: any) => {
    if (err) {
      return res.status(500).json({ error: "File upload failed" });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const result = await cloudinary.v2.uploader.upload(file.path, {
        folder: "uploads",
        resource_type: "raw", // ✅ REQUIRED FOR PDF
        use_filename: true,
        unique_filename: true,
      });
      const signedUrl = cloudinary.v2.utils.private_download_url(
        `${result.public_id}.${result.format}`,
        result.format,
        { resource_type: "raw" },
      );

      // Clean temp file
      fs.unlinkSync(file.path);

      return res.status(200).json({
        message: "File uploaded successfully",
        public_id: result.public_id,
        fileUrl: signedUrl,
        downloadUrl: `${result.secure_url}?dl=true`,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Cloudinary upload failed",
      });
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

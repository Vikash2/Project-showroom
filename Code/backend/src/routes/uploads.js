const express = require("express");
const router = express.Router();
const multer = require("multer");
const { supabase } = require("../config/supabase");
const authenticate = require("../middleware/authenticate");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * POST /api/uploads/presigned
 * Get presigned URL for direct upload (Supabase Storage)
 */
router.post("/presigned", authenticate, async (req, res, next) => {
  try {
    const { filename, contentType, folder = "general" } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        error: "filename and contentType are required",
        code: "MISSING_PARAMETERS",
      });
    }

    const timestamp = Date.now();
    const storePath = `${folder}/${timestamp}_${filename}`;

    // Create a signed upload URL
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUploadUrl(storePath);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(storePath);

    res.json({
      uploadUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      storePath,
      token: data.token,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    next(error);
  }
});

/**
 * POST /api/uploads/direct
 * Direct file upload to Supabase Storage
 */
router.post(
  "/direct",
  authenticate,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          code: "NO_FILE",
        });
      }

      const { folder = "general" } = req.body;
      const file = req.file;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: "Invalid file type. Allowed: JPEG, PNG, GIF, WEBP, PDF",
          code: "INVALID_FILE_TYPE",
        });
      }

      const timestamp = Date.now();
      const storePath = `${folder}/${timestamp}_${file.originalname}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("documents")
        .upload(storePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(storePath);

      res.json({
        success: true,
        url: publicUrlData.publicUrl,
        storePath: data.path,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
    } catch (error) {
      console.error("Direct upload error:", error);
      next(error);
    }
  }
);

/**
 * DELETE /api/uploads/:folder/:filename
 * Delete a file from Supabase Storage
 */
router.delete("/:folder/:filename", authenticate, async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const storePath = `${folder}/${filename}`;

    const { error } = await supabase.storage
      .from("documents")
      .remove([storePath]);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "File deleted successfully",
      storePath,
    });
  } catch (error) {
    if (error.statusCode === "404") {
      return res.status(404).json({
        error: "File not found",
        code: "FILE_NOT_FOUND",
      });
    }
    console.error("Delete file error:", error);
    next(error);
  }
});

module.exports = router;

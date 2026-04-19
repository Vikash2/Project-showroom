const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/firebase");
const authenticate = require("../middleware/authenticate");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * POST /api/uploads/presigned
 * Get presigned URL for direct upload
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

    const bucket = storage.bucket();
    const timestamp = Date.now();
    const storePath = `${folder}/${timestamp}_${filename}`;
    const file = bucket.file(storePath);

    // Generate signed URL for upload
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    // Generate public URL for reading
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storePath}`;

    res.json({
      uploadUrl,
      publicUrl,
      storePath,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    next(error);
  }
});

/**
 * POST /api/uploads/direct
 * Direct file upload to Firebase Storage
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

      const bucket = storage.bucket();
      const timestamp = Date.now();
      const storePath = `${folder}/${timestamp}_${file.originalname}`;
      const fileRef = bucket.file(storePath);

      // Upload file
      await fileRef.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
          metadata: {
            uploadedBy: req.user.uid,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make file publicly readable
      await fileRef.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storePath}`;

      res.json({
        success: true,
        url: publicUrl,
        storePath,
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
 * DELETE /api/uploads/:path
 * Delete a file from Firebase Storage
 */
router.delete("/:folder/:filename", authenticate, async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const storePath = `${folder}/${filename}`;

    const bucket = storage.bucket();
    const file = bucket.file(storePath);

    await file.delete();

    res.json({
      success: true,
      message: "File deleted successfully",
      storePath,
    });
  } catch (error) {
    if (error.code === 404) {
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

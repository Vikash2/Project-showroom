const express = require("express");
const router = express.Router();
const multer = require("multer");
const { supabase } = require("../config/supabase");
const authenticate = require("../middleware/authenticate");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF or PDF files are allowed'));
    }
  },
});

/**
 * POST /api/documents/upload
 * Upload document for a booking or sale
 */
router.post(
  "/upload",
  authenticate,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { bookingId, saleId, documentType } = req.body;
      const file = req.file;

      console.log('[documents] Upload request:', {
        bookingId,
        saleId,
        documentType,
        fileName: file?.originalname,
        fileSize: file?.size,
        fileType: file?.mimetype,
      });

      // Must have either bookingId or saleId
      if (!bookingId && !saleId) {
        return res.status(400).json({
          error: "Either bookingId or saleId is required",
          code: "MISSING_PARAMETERS",
        });
      }

      if (!documentType) {
        return res.status(400).json({
          error: "documentType is required",
          code: "MISSING_PARAMETERS",
        });
      }

      if (!file) {
        return res.status(400).json({
          error: "No file uploaded",
          code: "NO_FILE",
        });
      }

      let entityId, entityType, showroomId, salesExecutiveId;

      // Determine entity type and verify access
      if (bookingId) {
        entityType = 'booking';
        entityId = bookingId;

        // Verify booking exists and user has access
        const { data: booking, error: bookingErr } = await supabase
          .from("bookings")
          .select("id, showroom_id, sales_executive_id")
          .eq("id", bookingId)
          .single();

        if (bookingErr || !booking) {
          return res.status(404).json({
            error: "Booking not found",
            code: "BOOKING_NOT_FOUND",
          });
        }

        showroomId = booking.showroom_id;
        salesExecutiveId = booking.sales_executive_id;
      } else {
        entityType = 'sale';
        entityId = saleId;

        // Verify sale exists and user has access
        const { data: sale, error: saleErr } = await supabase
          .from("sales")
          .select("id, showroom_id, sales_executive_id")
          .eq("id", saleId)
          .single();

        if (saleErr || !sale) {
          return res.status(404).json({
            error: "Sale not found",
            code: "SALE_NOT_FOUND",
          });
        }

        showroomId = sale.showroom_id;
        salesExecutiveId = sale.sales_executive_id;
      }

      // Check access permissions
      if (
        req.user.role !== "Super Admin" &&
        req.user.showroomId !== showroomId &&
        req.user.uid !== salesExecutiveId
      ) {
        return res.status(403).json({
          error: "Access denied",
          code: "ACCESS_DENIED",
        });
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${entityId}_${documentType}_${timestamp}.${fileExt}`;
      const filePath = `${entityType}s/${entityId}/${fileName}`;

      console.log('[documents] Uploading to storage:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadErr) {
        console.error('[documents] Storage upload error:', uploadErr);
        throw uploadErr;
      }

      console.log('[documents] File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      console.log('[documents] Public URL:', publicUrl);

      // Update entity documents in database
      const tableName = entityType === 'booking' ? 'bookings' : 'sales';
      const { data: currentEntity, error: fetchErr } = await supabase
        .from(tableName)
        .select("documents")
        .eq("id", entityId)
        .single();

      if (fetchErr) {
        console.error(`[documents] Fetch ${entityType} error:`, fetchErr);
        throw fetchErr;
      }

      const documents = currentEntity.documents || {};
      documents[documentType] = {
        file: {
          name: file.originalname,
          type: file.mimetype,
          url: publicUrl,
          path: filePath,
          uploadedAt: new Date().toISOString(),
          uploadedBy: req.user.uid,
        },
      };

      console.log(`[documents] Updating ${entityType} documents:`, documents);

      // Update entity with document info
      const { error: updateErr } = await supabase
        .from(tableName)
        .update({ documents })
        .eq("id", entityId);

      if (updateErr) {
        console.error(`[documents] Update ${entityType} error:`, updateErr);
        throw updateErr;
      }

      console.log(`[documents] ${entityType} updated successfully`);

      res.json({
        success: true,
        url: publicUrl,
        path: filePath,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('[documents] Upload error:', error);
      next(error);
    }
  }
);

/**
 * DELETE /api/documents/:entityId/:documentType
 * Delete document for a booking or sale
 * Query param: type=booking|sale (defaults to booking for backward compatibility)
 */
router.delete(
  "/:entityId/:documentType",
  authenticate,
  async (req, res, next) => {
    try {
      const { entityId, documentType } = req.params;
      const entityType = req.query.type || 'booking'; // Default to booking for backward compatibility

      console.log('[documents] Delete request:', { entityId, documentType, entityType });

      const tableName = entityType === 'booking' ? 'bookings' : 'sales';

      // Verify entity exists and user has access
      const { data: entity, error: entityErr } = await supabase
        .from(tableName)
        .select("id, showroom_id, sales_executive_id, documents")
        .eq("id", entityId)
        .single();

      if (entityErr || !entity) {
        return res.status(404).json({
          error: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`,
          code: `${entityType.toUpperCase()}_NOT_FOUND`,
        });
      }

      // Check access permissions
      if (
        req.user.role !== "Super Admin" &&
        req.user.showroomId !== entity.showroom_id &&
        req.user.uid !== entity.sales_executive_id
      ) {
        return res.status(403).json({
          error: "Access denied",
          code: "ACCESS_DENIED",
        });
      }

      const documents = entity.documents || {};
      const document = documents[documentType];

      if (!document || !document.file) {
        return res.status(404).json({
          error: "Document not found",
          code: "DOCUMENT_NOT_FOUND",
        });
      }

      // Delete from storage
      const filePath = document.file.path;
      if (filePath) {
        console.log('[documents] Deleting from storage:', filePath);
        const { error: deleteErr } = await supabase.storage
          .from("documents")
          .remove([filePath]);

        if (deleteErr) {
          console.error('[documents] Storage delete error:', deleteErr);
          // Continue even if storage delete fails
        }
      }

      // Remove from entity documents
      delete documents[documentType];

      const { error: updateErr } = await supabase
        .from(tableName)
        .update({ documents })
        .eq("id", entityId);

      if (updateErr) {
        console.error(`[documents] Update ${entityType} error:`, updateErr);
        throw updateErr;
      }

      console.log('[documents] Document deleted successfully');

      res.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.error('[documents] Delete error:', error);
      next(error);
    }
  }
);

/**
 * GET /api/documents/:entityId/:documentType
 * Get document URL for a booking or sale
 * Query param: type=booking|sale (defaults to booking for backward compatibility)
 */
router.get(
  "/:entityId/:documentType",
  authenticate,
  async (req, res, next) => {
    try {
      const { entityId, documentType } = req.params;
      const entityType = req.query.type || 'booking'; // Default to booking for backward compatibility

      const tableName = entityType === 'booking' ? 'bookings' : 'sales';

      // Verify entity exists and user has access
      const { data: entity, error: entityErr } = await supabase
        .from(tableName)
        .select("id, showroom_id, sales_executive_id, documents")
        .eq("id", entityId)
        .single();

      if (entityErr || !entity) {
        return res.status(404).json({
          error: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`,
          code: `${entityType.toUpperCase()}_NOT_FOUND`,
        });
      }

      // Check access permissions
      if (
        req.user.role !== "Super Admin" &&
        req.user.showroomId !== entity.showroom_id &&
        req.user.uid !== entity.sales_executive_id
      ) {
        return res.status(403).json({
          error: "Access denied",
          code: "ACCESS_DENIED",
        });
      }

      const documents = entity.documents || {};
      const document = documents[documentType];

      if (!document || !document.file) {
        return res.status(404).json({
          error: "Document not found",
          code: "DOCUMENT_NOT_FOUND",
        });
      }

      res.json({
        success: true,
        url: document.file.url,
        document: document.file,
      });
    } catch (error) {
      console.error('[documents] Get URL error:', error);
      next(error);
    }
  }
);

module.exports = router;

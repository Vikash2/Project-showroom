const express = require("express");
const router = express.Router();
const salesService = require("../services/salesService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");

// ============================================================
// SALES CREATION & UPDATE ENDPOINTS
// ============================================================

/**
 * POST /api/sales
 * Create a direct sale (without booking)
 */
router.post(
  "/",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  async (req, res, next) => {
    try {
      // Get showroom from user context
      const showroomId = req.user.showroomId;
      
      if (!showroomId && req.user.role !== "Super Admin") {
        return res.status(400).json({
          error: "Showroom ID is required",
          code: "SHOWROOM_REQUIRED",
        });
      }

      // If Super Admin, require showroomId in body
      const finalShowroomId = req.user.role === "Super Admin" 
        ? req.body.showroomId 
        : showroomId;

      if (!finalShowroomId) {
        return res.status(400).json({
          error: "Showroom ID is required",
          code: "SHOWROOM_REQUIRED",
        });
      }

      const result = await salesService.createDirectSale(
        req.body,
        req.user.uid,
        finalShowroomId
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sales/bookings/:bookingId
 * Create or update sale from booking
 */
router.post(
  "/bookings/:bookingId",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  async (req, res, next) => {
    try {
      const result = await salesService.createSaleFromBooking(
        req.params.bookingId,
        req.body,
        req.user.uid
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/sales/:id
 * Update existing sale
 */
router.patch(
  "/:id",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  async (req, res, next) => {
    try {
      const result = await salesService.updateSale(
        req.params.id,
        req.body,
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// APPROVAL ENDPOINTS
// ============================================================

/**
 * POST /api/sales/:id/approve-discount
 * Approve special discount (Manager/Super Admin only)
 */
router.post(
  "/:id/approve-discount",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  async (req, res, next) => {
    try {
      const result = await salesService.approveSpecialDiscount(
        req.params.id,
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/sales/:id/reject-discount
 * Reject special discount
 */
router.post(
  "/:id/reject-discount",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  async (req, res, next) => {
    try {
      const { reason } = req.body;

      if (!reason || reason.trim() === "") {
        return res.status(400).json({
          error: "Rejection reason is required",
          code: "REASON_REQUIRED",
        });
      }

      const result = await salesService.rejectSpecialDiscount(
        req.params.id,
        reason
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// TRANSFER TO CASHIER
// ============================================================

/**
 * POST /api/sales/:id/transfer-to-cashier
 * Transfer finalized sale to cashier for payment collection
 */
router.post(
  "/:id/transfer-to-cashier",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  async (req, res, next) => {
    try {
      const result = await salesService.transferToCashier(
        req.params.id,
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// RETRIEVAL ENDPOINTS
// ============================================================

/**
 * GET /api/sales
 * List all sales with filters
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, paymentStatus, saleType, dateFrom, dateTo } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (saleType) filters.saleType = saleType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const sales = await salesService.listSales(filters, req.user);
    
    res.json({ 
      sales, 
      count: sales.length 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sales/:id
 * Get single sale by ID
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const sale = await salesService.getSale(req.params.id);

    if (!sale) {
      return res.status(404).json({
        error: "Sale not found",
        code: "SALE_NOT_FOUND",
      });
    }

    res.json({ sale });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sales/bookings/:bookingId
 * Get sale by booking ID
 */
router.get("/bookings/:bookingId", authenticate, async (req, res, next) => {
  try {
    const sale = await salesService.getSaleByBookingId(req.params.bookingId);

    if (!sale) {
      return res.status(404).json({
        error: "Sale not found for this booking",
        code: "SALE_NOT_FOUND",
      });
    }

    res.json({ sale });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

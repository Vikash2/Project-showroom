const express = require("express");
const router = express.Router();
const cashierService = require("../services/cashierService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");

// ============================================================
// PAYMENT COLLECTION ENDPOINTS
// ============================================================

/**
 * POST /api/cashier/sales/:id/collect-payment
 * Collect payment and issue money receipt
 */
router.post(
  "/sales/:id/collect-payment",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      const { amount, paymentMethod, transactionReference, notes } = req.body;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: "Invalid amount",
          code: "INVALID_AMOUNT",
        });
      }

      if (!paymentMethod) {
        return res.status(400).json({
          error: "Payment method is required",
          code: "PAYMENT_METHOD_REQUIRED",
        });
      }

      const validMethods = ["Cash", "Card", "UPI", "Bank Transfer", "Cheque"];
      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({
          error: "Invalid payment method",
          code: "INVALID_PAYMENT_METHOD",
        });
      }

      const result = await cashierService.collectPayment(
        req.params.id,
        { amount, paymentMethod, transactionReference, notes },
        req.user.uid
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/cashier/sales/:id/confirm-payment
 * Confirm payment and lock the sale
 */
router.post(
  "/sales/:id/confirm-payment",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      const result = await cashierService.confirmPayment(req.params.id, req.user.uid);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// BACKWARD COMPATIBILITY: Booking-based endpoints
// These redirect to sale-based endpoints
// ============================================================

/**
 * POST /api/cashier/bookings/:id/collect-payment
 * DEPRECATED: Use /api/cashier/sales/:saleId/collect-payment instead
 */
router.post(
  "/bookings/:id/collect-payment",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      // Find sale by booking ID
      const { data: sale } = await require("../config/supabase").supabase
        .from("sales")
        .select("id")
        .eq("booking_id", req.params.id)
        .single();

      if (!sale) {
        return res.status(404).json({
          error: "Sale not found for this booking",
          code: "SALE_NOT_FOUND",
        });
      }

      // Forward to sale-based endpoint
      req.params.id = sale.id;
      return router.handle(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/cashier/bookings/:id/confirm-payment
 * DEPRECATED: Use /api/cashier/sales/:saleId/confirm-payment instead
 */
router.post(
  "/bookings/:id/confirm-payment",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      // Find sale by booking ID
      const { data: sale } = await require("../config/supabase").supabase
        .from("sales")
        .select("id")
        .eq("booking_id", req.params.id)
        .single();

      if (!sale) {
        return res.status(404).json({
          error: "Sale not found for this booking",
          code: "SALE_NOT_FOUND",
        });
      }

      const result = await cashierService.confirmPayment(sale.id, req.user.uid);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// INVOICE ENDPOINTS
// ============================================================

/**
 * POST /api/cashier/sales/:id/approve-invoice
 * Approve and generate tax invoice
 */
router.post(
  "/sales/:id/approve-invoice",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      const result = await cashierService.approveTaxInvoice(req.params.id, req.user.uid);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/cashier/bookings/:id/approve-invoice
 * DEPRECATED: Use /api/cashier/sales/:saleId/approve-invoice instead
 */
router.post(
  "/bookings/:id/approve-invoice",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      // Find sale by booking ID
      const { data: sale } = await require("../config/supabase").supabase
        .from("sales")
        .select("id")
        .eq("booking_id", req.params.id)
        .single();

      if (!sale) {
        return res.status(404).json({
          error: "Sale not found for this booking",
          code: "SALE_NOT_FOUND",
        });
      }

      const result = await cashierService.approveTaxInvoice(sale.id, req.user.uid);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// HOLD/RELEASE ENDPOINTS
// ============================================================

/**
 * POST /api/cashier/bookings/:id/hold
 * Place insurance or registration on hold
 */
router.post(
  "/bookings/:id/hold",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      const { serviceType, reason } = req.body;

      if (!serviceType || !["insurance", "registration"].includes(serviceType)) {
        return res.status(400).json({
          error: "Invalid service type. Must be 'insurance' or 'registration'",
          code: "INVALID_SERVICE_TYPE",
        });
      }

      if (!reason || reason.trim() === "") {
        return res.status(400).json({
          error: "Reason is required for placing hold",
          code: "REASON_REQUIRED",
        });
      }

      const result = await cashierService.holdService(
        req.params.id,
        serviceType,
        reason,
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/cashier/bookings/:id/release-hold
 * Release hold on insurance or registration
 */
router.post(
  "/bookings/:id/release-hold",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Cashier"),
  async (req, res, next) => {
    try {
      const { serviceType } = req.body;

      if (!serviceType || !["insurance", "registration"].includes(serviceType)) {
        return res.status(400).json({
          error: "Invalid service type. Must be 'insurance' or 'registration'",
          code: "INVALID_SERVICE_TYPE",
        });
      }

      const result = await cashierService.releaseHold(
        req.params.id,
        serviceType,
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// RECEIPT & INVOICE RETRIEVAL ENDPOINTS
// ============================================================

/**
 * GET /api/cashier/receipts
 * List all money receipts
 */
router.get("/receipts", authenticate, async (req, res, next) => {
  try {
    const { bookingId, dateFrom, dateTo } = req.query;
    const filters = {};

    if (bookingId) filters.bookingId = bookingId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const receipts = await cashierService.listReceipts(filters, req.user);
    res.json({ receipts, count: receipts.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cashier/receipts/:identifier
 * Get single receipt by ID or receipt number
 */
router.get("/receipts/:identifier", authenticate, async (req, res, next) => {
  try {
    const receipt = await cashierService.getReceipt(req.params.identifier);

    if (!receipt) {
      return res.status(404).json({
        error: "Receipt not found",
        code: "RECEIPT_NOT_FOUND",
      });
    }

    res.json({ receipt });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cashier/invoices/:identifier
 * Get single invoice by ID or invoice number
 */
router.get("/invoices/:identifier", authenticate, async (req, res, next) => {
  try {
    const invoice = await cashierService.getInvoice(req.params.identifier);

    if (!invoice) {
      return res.status(404).json({
        error: "Invoice not found",
        code: "INVOICE_NOT_FOUND",
      });
    }

    res.json({ invoice });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

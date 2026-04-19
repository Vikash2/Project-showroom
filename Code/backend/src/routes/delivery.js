const express = require("express");
const router = express.Router();
const deliveryService = require("../services/deliveryService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");

// ============================================================
// DELIVERY MANAGEMENT ENDPOINTS
// ============================================================

/**
 * PATCH /api/delivery/sales/:id/status
 * Update delivery status
 */
router.patch(
  "/sales/:id/status",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive", "PDI Officer"),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          error: "Delivery status is required",
          code: "STATUS_REQUIRED",
        });
      }

      const result = await deliveryService.updateDeliveryStatus(
        req.params.id,
        status,
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/delivery/sales/:id/confirm
 * Confirm delivery completion
 */
router.post(
  "/sales/:id/confirm",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive", "PDI Officer"),
  async (req, res, next) => {
    try {
      const { notes } = req.body;

      const result = await deliveryService.confirmDelivery(
        req.params.id,
        { notes },
        req.user.uid
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/delivery/sales/:id
 * Get delivery details for a sale
 */
router.get("/sales/:id", authenticate, async (req, res, next) => {
  try {
    const result = await deliveryService.getDeliveryDetails(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/delivery
 * List all deliveries with filters
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, confirmed, dateFrom, dateTo } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (confirmed !== undefined) filters.confirmed = confirmed === 'true';
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const deliveries = await deliveryService.listDeliveries(filters, req.user);

    res.json({
      deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

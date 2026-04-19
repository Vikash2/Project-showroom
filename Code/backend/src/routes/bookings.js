const express = require("express");
const router = express.Router();
const bookingService = require("../services/bookingService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const {
  validate,
  CreateBookingSchema,
  UpdateStatusSchema,
  AssignChassisSchema,
  AssignExecutiveSchema,
  RequestApprovalSchema,
  HandleApprovalSchema,
  AddPaymentSchema,
} = require("../validators/bookingValidator");

// ============================================================
// CORE BOOKING ENDPOINTS
// ============================================================

/**
 * POST /api/bookings
 * Create new booking. (Sales Execs, Managers, Admins)
 */
router.post(
  "/",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  validate(CreateBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await bookingService.createBooking(req.body, req.user.uid);
      res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/bookings
 * List with role-based filtering
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, showroomId } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (showroomId) filters.showroomId = showroomId;

    const bookings = await bookingService.listBookings(filters, req.user);
    res.json({ bookings, count: bookings.length });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/bookings/:id/status
 * Transition Status
 */
router.patch(
  "/:id/status",
  authenticate,
  validate(UpdateStatusSchema),
  async (req, res, next) => {
    try {
      const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status);
      res.json({ message: "Status updated", booking });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/bookings/:id/assign
 * Assign to Sales Executive
 */
router.patch(
  "/:id/assign",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(AssignExecutiveSchema),
  async (req, res, next) => {
    try { // Re-using Supabase direct simple update logic
      // In advanced implementations this goes in the service.
      const { data, error } = await require("../config/supabase").supabase
        .from("bookings").update({ sales_executive_id: req.body.assignedTo })
        .eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ message: "Executive Assigned Successfully", booking: data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/bookings/:id/chassis
 * Set Chassis Number (Stock Allocation)
 */
router.patch(
  "/:id/chassis",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  validate(AssignChassisSchema),
  async (req, res, next) => {
    try {
      const booking = await bookingService.assignChassis(req.params.id, req.body.chassisNumber, req.body.engineNumber);
      res.json({ message: "Chassis Assigned Successfully", booking });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// SALES FORM & APPROVAL ENDPOINTS
// ============================================================

/**
 * POST /api/bookings/:id/sale/request-approval
 */
router.post(
  "/:id/sale/request-approval",
  authenticate,
  validate(RequestApprovalSchema),
  async (req, res, next) => {
    try {
      const saleContext = await bookingService.requestApproval(req.params.id, req.body.discountAmount, req.user.uid);
      res.json({ message: "Approval Requested", sale: saleContext });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/bookings/:id/sale/approve (Takes isApproved: bool)
 */
router.post(
  "/:id/sale/approve",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(HandleApprovalSchema),
  async (req, res, next) => {
    try {
      const saleContext = await bookingService.handleApproval(req.params.id, req.body.isApproved, req.user.uid, req.body.reason);
      res.json({ message: req.body.isApproved ? "Discount Approved" : "Discount Rejected", sale: saleContext });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PAYMENTS & FINAL DELIVERY LOOP
// ============================================================

/**
 * POST /api/bookings/:id/payments
 */
router.post(
  "/:id/payments",
  authenticate,
  validate(AddPaymentSchema),
  async (req, res, next) => {
    try {
      const payment = await bookingService.addPayment(req.params.id, req.body, req.user.uid);
      res.json({ message: "Payment tracked", payment });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/bookings/:id/confirm-payment
 * Confirm payment and update all related tables (booking + sales)
 */
router.post(
  "/:id/confirm-payment",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Accountant", "Cashier"),
  async (req, res, next) => {
    try {
      const cashierService = require("../services/cashierService");
      const result = await cashierService.confirmPayment(req.params.id, req.user.uid);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/bookings/:id/confirm-delivery
 */
router.post(
  "/:id/confirm-delivery",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  async (req, res, next) => {
    try {
      const { notes } = req.body;
      const result = await bookingService.confirmDelivery(req.params.id, req.user.uid, notes);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

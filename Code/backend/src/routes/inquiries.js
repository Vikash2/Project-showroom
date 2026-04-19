const express = require("express");
const router = express.Router();
const inquiryService = require("../services/inquiryService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const {
  validate,
  CreateInquirySchema,
  UpdateStatusSchema,
  AssignInquirySchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  AddHistorySchema,
} = require("../validators/inquiryValidator");

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

/**
 * POST /api/inquiries
 * Create a new inquiry (public — no auth required)
 */
router.post("/", validate(CreateInquirySchema), async (req, res, next) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// AUTHENTICATED ENDPOINTS
// ============================================================

/**
 * GET /api/inquiries
 * List inquiries with role-based filtering
 * Query params: status, assignedTo, showroomId, source, dateFrom, dateTo, search, isActive
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const {
      status,
      assignedTo,
      showroomId,
      source,
      dateFrom,
      dateTo,
      search,
      isActive,
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (showroomId) filters.showroomId = showroomId;
    if (source) filters.source = source;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const inquiries = await inquiryService.listInquiries(filters, req.user);
    res.json({ inquiries, count: inquiries.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/inquiries/:id
 * Get single inquiry with tasks and history
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiry(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        error: "Inquiry not found",
        code: "INQUIRY_NOT_FOUND",
      });
    }

    // Access control: Super Admin sees all, Manager sees showroom, others see assigned
    const { role, showroomId, uid } = req.user;
    if (role === "Super Admin") {
      // OK
    } else if (
      role === "Showroom Manager" &&
      inquiry.showroomId === showroomId
    ) {
      // OK
    } else if (inquiry.assignedTo === uid) {
      // OK
    } else {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      });
    }

    res.json({ inquiry });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/inquiries/:id/status
 * Move inquiry through pipeline stages
 */
router.patch(
  "/:id/status",
  authenticate,
  validate(UpdateStatusSchema),
  async (req, res, next) => {
    try {
      const inquiry = await inquiryService.updateInquiryStatus(
        req.params.id,
        req.body.status,
        req.user.uid
      );
      res.json({
        message: "Status updated successfully",
        inquiry,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/inquiries/:id/assign
 * Assign inquiry to a sales executive (Manager+ only)
 */
router.patch(
  "/:id/assign",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(AssignInquirySchema),
  async (req, res, next) => {
    try {
      const inquiry = await inquiryService.assignInquiry(
        req.params.id,
        req.body.assignedTo,
        req.user.uid
      );
      res.json({
        message: "Inquiry assigned successfully",
        inquiry,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// TASK ENDPOINTS
// ============================================================

/**
 * POST /api/inquiries/:id/tasks
 * Add a follow-up task
 */
router.post(
  "/:id/tasks",
  authenticate,
  validate(CreateTaskSchema),
  async (req, res, next) => {
    try {
      const task = await inquiryService.createTask(
        req.params.id,
        req.body,
        req.user.uid
      );
      res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/inquiries/:id/tasks/:taskId
 * Update task status/details
 */
router.patch(
  "/:id/tasks/:taskId",
  authenticate,
  validate(UpdateTaskSchema),
  async (req, res, next) => {
    try {
      const task = await inquiryService.updateTask(
        req.params.id,
        req.params.taskId,
        req.body
      );
      res.json({
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// HISTORY/COMMUNICATION ENDPOINTS
// ============================================================

/**
 * POST /api/inquiries/:id/history
 * Log a communication entry
 */
router.post(
  "/:id/history",
  authenticate,
  validate(AddHistorySchema),
  async (req, res, next) => {
    try {
      const entry = await inquiryService.addHistory(
        req.params.id,
        req.body,
        req.user.uid
      );
      res.status(201).json({
        message: "History entry added successfully",
        entry,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// CONVERSION ENDPOINT
// ============================================================

/**
 * POST /api/inquiries/:id/convert-to-booking
 * Convert an inquiry into a booking
 */
router.post(
  "/:id/convert-to-booking",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager", "Sales Executive"),
  async (req, res, next) => {
    try {
      const result = await inquiryService.convertToBooking(
        req.params.id,
        req.user.uid
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// DELETE ENDPOINT
// ============================================================

/**
 * DELETE /api/inquiries/:id
 * Soft delete (Manager+ only)
 */
router.delete(
  "/:id",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  async (req, res, next) => {
    try {
      const result = await inquiryService.deleteInquiry(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

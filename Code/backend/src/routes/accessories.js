const express = require("express");
const router = express.Router();
const accessoryService = require("../services/accessoryService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const { validate, CreateAccessorySchema, UpdateAccessorySchema } = require("../validators/accessoryValidator");

/**
 * GET /api/accessories
 * List all accessories with optional filters
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, vehicleId, isActive, showroomId } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (vehicleId) filters.vehicleId = vehicleId;
    if (showroomId) filters.showroomId = showroomId;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const accessories = await accessoryService.listAccessories(filters);
    res.json({ accessories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/accessories/:id
 * Get single accessory
 */
router.get("/:id", async (req, res, next) => {
  try {
    const accessory = await accessoryService.getAccessory(req.params.id);
    
    if (!accessory) {
      return res.status(404).json({
        error: "Accessory not found",
        code: "ACCESSORY_NOT_FOUND",
      });
    }

    res.json({ accessory });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/accessories
 * Create accessory (Manager+)
 */
router.post(
  "/",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(CreateAccessorySchema),
  async (req, res, next) => {
    try {
      const accessory = await accessoryService.createAccessory(req.body);
      res.status(201).json({
        message: "Accessory created successfully",
        accessory,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/accessories/:id
 * Update accessory pricing/stock
 */
router.patch(
  "/:id",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(UpdateAccessorySchema),
  async (req, res, next) => {
    try {
      const accessory = await accessoryService.updateAccessory(req.params.id, req.body);
      res.json({
        message: "Accessory updated successfully",
        accessory,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/accessories/:id
 * Soft delete accessory
 */
router.delete(
  "/:id",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  async (req, res, next) => {
    try {
      const result = await accessoryService.deleteAccessory(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

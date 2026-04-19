const express = require("express");
const router = express.Router();
const vehicleService = require("../services/vehicleService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const { validate, CreateVehicleSchema, UpdateVehicleSchema, UpdateStockSchema } = require("../validators/vehicleValidator");

/**
 * GET /api/vehicles
 * List all vehicles (public - no auth required)
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, brand, isActive, showroomId } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (showroomId) filters.showroomId = showroomId;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const vehicles = await vehicleService.listVehicles(filters);
    res.json({ vehicles });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vehicles/:id
 * Get single vehicle with all variants/colors (public)
 */
router.get("/:id", async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicle(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found",
        code: "VEHICLE_NOT_FOUND",
      });
    }

    res.json({ vehicle });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/vehicles
 * Create vehicle (Super Admin, Manager)
 */
router.post(
  "/",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(CreateVehicleSchema),
  async (req, res, next) => {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json({
        message: "Vehicle created successfully",
        vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/vehicles/:id
 * Update vehicle metadata
 */
router.patch(
  "/:id",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(UpdateVehicleSchema),
  async (req, res, next) => {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
      res.json({
        message: "Vehicle updated successfully",
        vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/vehicles/:id/variants/:variantId/stock
 * Update stock for a specific color
 */
router.patch(
  "/:id/variants/:variantId/stock",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  validate(UpdateStockSchema),
  async (req, res, next) => {
    try {
      const { id, variantId } = req.params;
      const { colorName } = req.query;

      if (!colorName) {
        return res.status(400).json({
          error: "colorName query parameter is required",
          code: "MISSING_COLOR_NAME",
        });
      }

      const vehicle = await vehicleService.updateStock(
        id,
        variantId,
        colorName,
        req.body
      );

      res.json({
        message: "Stock updated successfully",
        vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/vehicles/:id
 * Soft delete vehicle
 */
router.delete(
  "/:id",
  authenticate,
  roleGuard("Super Admin", "Showroom Manager"),
  async (req, res, next) => {
    try {
      const result = await vehicleService.deleteVehicle(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

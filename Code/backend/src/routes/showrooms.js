const express = require("express");
const router = express.Router();
const showroomService = require("../services/showroomService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const { validate, CreateShowroomSchema, UpdateShowroomSchema } = require("../validators/showroomValidator");

/**
 * GET /api/showrooms
 * List all showrooms (all authenticated users)
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filters = {};
    
    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    const showrooms = await showroomService.listShowrooms(filters);
    res.json({ showrooms });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/showrooms/:id
 * Get single showroom
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const showroom = await showroomService.getShowroom(req.params.id);
    
    if (!showroom) {
      return res.status(404).json({
        error: "Showroom not found",
        code: "SHOWROOM_NOT_FOUND",
      });
    }

    res.json({ showroom });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/showrooms
 * Create showroom (Super Admin only)
 */
router.post(
  "/",
  authenticate,
  roleGuard("Super Admin"),
  validate(CreateShowroomSchema),
  async (req, res, next) => {
    try {
      const showroom = await showroomService.createShowroom(req.body);
      res.status(201).json({
        message: "Showroom created successfully",
        showroom,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/showrooms/:id
 * Update showroom (Super Admin or Manager of that showroom)
 */
router.patch(
  "/:id",
  authenticate,
  validate(UpdateShowroomSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role, showroomId } = req.user;

      // Access control: Super Admin or Manager of this showroom
      if (role !== "Super Admin" && showroomId !== id) {
        return res.status(403).json({
          error: "Access denied. You can only update your own showroom.",
          code: "ACCESS_DENIED",
        });
      }

      const showroom = await showroomService.updateShowroom(id, req.body);
      res.json({
        message: "Showroom updated successfully",
        showroom,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/showrooms/:id
 * Delete showroom (Super Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  roleGuard("Super Admin"),
  async (req, res, next) => {
    try {
      const result = await showroomService.deleteShowroom(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

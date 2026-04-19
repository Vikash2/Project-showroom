const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const { validate, UpdateUserSchema, UpdateRoleSchema } = require("../validators/userValidator");

/**
 * GET /api/users
 * List all users (filtered by role)
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { role, showroomId } = req.user;
    let filters = {};

    // Super Admin sees all users
    if (role === "Super Admin") {
      // No filters
    } 
    // Showroom Manager sees only their showroom users
    else if (role === "Showroom Manager") {
      filters.showroomId = showroomId;
    } 
    // Others see only themselves
    else {
      return res.json({ users: [await userService.getUser(req.user.uid)] });
    }

    const users = await userService.listUsers(filters);
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:uid
 * Get single user profile
 */
router.get("/:uid", authenticate, async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role, showroomId, uid: requesterId } = req.user;

    const user = await userService.getUser(uid);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Access control
    if (role === "Super Admin") {
      // Can see anyone
    } else if (role === "Showroom Manager" && user.showroomId === showroomId) {
      // Can see users in their showroom
    } else if (uid === requesterId) {
      // Can see themselves
    } else {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/:uid
 * Update user profile
 */
router.patch(
  "/:uid",
  authenticate,
  validate(UpdateUserSchema),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { role, uid: requesterId } = req.user;

      // Only Super Admin or the user themselves can update profile
      if (role !== "Super Admin" && uid !== requesterId) {
        return res.status(403).json({
          error: "Access denied",
          code: "ACCESS_DENIED",
        });
      }

      const updatedUser = await userService.updateUser(uid, req.body);
      res.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/users/:uid/role
 * Update user role (Super Admin only)
 */
router.patch(
  "/:uid/role",
  authenticate,
  roleGuard("Super Admin"),
  validate(UpdateRoleSchema),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { role, showroomId } = req.body;

      const updatedUser = await userService.updateUserRole(uid, role, showroomId);
      res.json({
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/users/:uid
 * Disable user (Super Admin only)
 */
router.delete(
  "/:uid",
  authenticate,
  roleGuard("Super Admin"),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const result = await userService.deleteUser(uid);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

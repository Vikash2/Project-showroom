const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const authenticate = require("../middleware/authenticate");
const roleGuard = require("../middleware/roleGuard");
const { validate, CreateUserSchema } = require("../validators/userValidator");

/**
 * POST /api/auth/register
 * Create a new user (Super Admin only)
 */
router.post(
  "/register",
  authenticate,
  roleGuard("Super Admin"),
  validate(CreateUserSchema),
  async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        return res.status(409).json({
          error: "Email already exists",
          code: "EMAIL_EXISTS",
        });
      }
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await userService.getUser(req.user.uid);
    
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const { z } = require("zod");

// User registration schema
const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  role: z.enum(["Super Admin", "Showroom Manager", "Sales Executive", "Documentation Officer"]),
  showroomId: z.string().optional(),
});

// User update schema
const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  mobile: z.string().regex(/^\d{10}$/).optional(),
  email: z.string().email().optional(),
});

// Role update schema
const UpdateRoleSchema = z.object({
  role: z.enum(["Super Admin", "Showroom Manager", "Sales Executive", "Documentation Officer"]),
  showroomId: z.string().optional(),
});

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.error.flatten() 
      });
    }
    
    req.body = result.data;
    next();
  };
};

module.exports = {
  CreateUserSchema,
  UpdateUserSchema,
  UpdateRoleSchema,
  validate,
};

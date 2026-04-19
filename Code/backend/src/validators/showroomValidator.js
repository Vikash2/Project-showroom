const { z } = require("zod");

// Showroom schema
const CreateShowroomSchema = z.object({
  name: z.string().min(2, "Showroom name must be at least 2 characters"),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  contact: z.object({
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    email: z.string().email("Invalid email format"),
    whatsapp: z.string().regex(/^\d{10}$/).optional(),
  }),
  gstNumber: z.string().optional(),
  isActive: z.boolean().default(true),
});

const UpdateShowroomSchema = CreateShowroomSchema.partial();

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
  CreateShowroomSchema,
  UpdateShowroomSchema,
  validate,
};

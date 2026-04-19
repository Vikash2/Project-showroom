const { z } = require("zod");

// Accessory schema
const CreateAccessorySchema = z.object({
  name: z.string().min(2, "Accessory name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(2),
  price: z.number().positive("Price must be positive"),
  stockQty: z.number().int().min(0, "Stock quantity cannot be negative"),
  compatibleVehicles: z.array(z.string()).optional(), // Array of vehicle IDs
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().default(true),
  showroomId: z.string().optional(),
});

const UpdateAccessorySchema = CreateAccessorySchema.partial();

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
  CreateAccessorySchema,
  UpdateAccessorySchema,
  validate,
};

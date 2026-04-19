const { z } = require("zod");

// Color schema
const ColorSchema = z.object({
  name: z.string(),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  stockQty: z.number().int().min(0),
  status: z.enum(["In Stock", "Low Stock", "Out of Stock"]),
});

// Variant schema
const VariantSchema = z.object({
  name: z.string().min(2),
  pricing: z.object({
    exShowroom: z.number().positive(),
    rto: z.number().min(0),
    insurance: z.number().min(0),
    onRoadPrice: z.number().positive(),
  }),
  colors: z.record(z.string(), ColorSchema),
});

// Vehicle schema
const CreateVehicleSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(2),
  category: z.enum(["Scooter", "Motorcycle", "Electric"]),
  specs: z.object({
    mileage: z.string(),
    engine: z.string(),
    power: z.string().optional(),
    torque: z.string().optional(),
    fuelCapacity: z.string().optional(),
    weight: z.string().optional(),
  }),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.record(z.string(), VariantSchema),
  isActive: z.boolean().default(true),
  showroomId: z.string().optional(),
});

const UpdateVehicleSchema = CreateVehicleSchema.partial();

// Stock update schema
const UpdateStockSchema = z.object({
  stockQty: z.number().int().min(0),
  status: z.enum(["In Stock", "Low Stock", "Out of Stock"]).optional(),
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
  CreateVehicleSchema,
  UpdateVehicleSchema,
  UpdateStockSchema,
  validate,
};

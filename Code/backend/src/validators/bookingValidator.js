const { z } = require("zod");

// ============================================================
// Booking Schemas
// ============================================================

const CreateBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")).or(z.null()),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  vehicleId: z.string().uuid("Invalid Vehicle ID"),
  variantId: z.string().uuid("Invalid Variant ID"),
  colorId: z.string().uuid("Invalid Color ID"),
  showroomId: z.string().uuid("Invalid Showroom ID"),
  bookingAmount: z.number().min(0, "Booking amount cannot be negative").default(5000),
  assignedTo: z.string().uuid("Invalid Sales Executive ID").optional().or(z.null()),
  notes: z.string().optional().or(z.null()),
});

const UpdateStatusSchema = z.object({
  status: z.enum([
    "Pending", "Confirmed", "Documentation In-Progress", "Stock Allocated", 
    "Pending Approval", "Sales Finalized", "Payment Pending", "Payment Complete",
    "RTO Processing", "PDI Scheduled", "Ready for Delivery", "Delivered", "Cancelled"
  ]),
});

const AssignChassisSchema = z.object({
  chassisNumber: z.string().min(5, "Invalid Chassis Number"),
  engineNumber: z.string().min(5, "Invalid Engine Number"),
});

const AssignExecutiveSchema = z.object({
  assignedTo: z.string().uuid("Invalid User ID"),
});

// ============================================================
// Sales operations schemas
// ============================================================

const RequestApprovalSchema = z.object({
  discountAmount: z.number().min(1, "Discount amount must be positive"),
});

const HandleApprovalSchema = z.object({
  isApproved: z.boolean(),
  reason: z.string().optional(),
});

// ============================================================
// Add Payment schema
// ============================================================

const AddPaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  paymentMethod: z.enum(["Cash", "Card", "UPI", "Bank Transfer", "Finance", "Cheque"]),
  reference: z.string().optional(),
});

// ============================================================
// Validation Middleware Factory
// ============================================================
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    req.body = result.data;
    next();
  };
};

module.exports = {
  CreateBookingSchema,
  UpdateStatusSchema,
  AssignChassisSchema,
  AssignExecutiveSchema,
  RequestApprovalSchema,
  HandleApprovalSchema,
  AddPaymentSchema,
  validate,
};

const { z } = require("zod");

// ============================================================
// Inquiry Schemas
// ============================================================

// Public inquiry creation (no auth required)
const CreateInquirySchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  address: z.string().optional(),
  vehicleId: z.string().uuid().optional(),
  vehicleModel: z.string().optional(),
  variantPreference: z.string().optional(),
  colorPreference: z.string().optional(),
  budgetRange: z.string().optional(),
  exchangeVehicle: z.string().optional(),
  financeRequired: z.boolean().optional(),
  showroomId: z.string().uuid().optional(),
  source: z
    .enum([
      "Walk-in",
      "Phone",
      "Website",
      "Referral",
      "Social Media",
      "Advertisement",
      "Other",
    ])
    .optional(),
  notes: z.string().optional(),
});

// Status update schema
const UpdateStatusSchema = z.object({
  status: z.enum([
    "New",
    "Contacted",
    "Follow-up",
    "Test Ride Scheduled",
    "Hot Lead",
    "Quotation Sent",
    "Booking Done",
    "Lost",
    "Closed",
  ]),
});

// Assignment schema
const AssignInquirySchema = z.object({
  assignedTo: z.string().uuid("Invalid user ID"),
});

// Task schemas
const CreateTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
});

const UpdateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(["Pending", "Completed", "Overdue", "Cancelled"]).optional(),
});

// History/communication entry schema
const AddHistorySchema = z.object({
  type: z.enum([
    "Call",
    "SMS",
    "WhatsApp",
    "Email",
    "Visit",
    "Test Ride",
    "Note",
    "Status Change",
  ]),
  summary: z.string().min(2, "Summary must be at least 2 characters"),
  details: z.string().optional(),
  outcome: z.string().optional(),
});

// ============================================================
// Validation middleware factory
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
  CreateInquirySchema,
  UpdateStatusSchema,
  AssignInquirySchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  AddHistorySchema,
  validate,
};

const { supabase } = require("../config/supabase");

// ============================================================
// Lead Pipeline State Machine
// Validates that status transitions follow legal paths
// ============================================================
const TRANSITIONS = {
  New: ["Contacted", "Lost"],
  Contacted: ["Follow-up", "Test Ride Scheduled", "Lost"],
  "Follow-up": ["Contacted", "Hot Lead", "Lost"],
  "Test Ride Scheduled": ["Hot Lead", "Follow-up", "Lost"],
  "Hot Lead": ["Quotation Sent", "Lost"],
  "Quotation Sent": ["Booking Done", "Follow-up", "Lost"],
  "Booking Done": ["Closed"],
  Lost: ["New"], // re-open
  Closed: [],
};

function validateTransition(from, to) {
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    const error = new Error(
      `Invalid status transition: "${from}" → "${to}". Allowed: [${allowed.join(", ")}]`
    );
    error.statusCode = 400;
    error.code = "INVALID_TRANSITION";
    throw error;
  }
}

// ============================================================
// Inquiry CRUD
// ============================================================

/**
 * Create a new inquiry (public — no auth required)
 */
async function createInquiry(data) {
  try {
    const { data: inquiry, error } = await supabase
      .from("leads")
      .insert({
        customer_name: data.customerName,
        email: data.email || null,
        mobile: data.mobile,
        address: data.address || null,
        vehicle_id: data.vehicleId || null,
        vehicle_model: data.vehicleModel || null,
        variant_preference: data.variantPreference || null,
        color_preference: data.colorPreference || null,
        budget_range: data.budgetRange || null,
        exchange_vehicle: data.exchangeVehicle || null,
        finance_required: data.financeRequired || false,
        showroom_id: data.showroomId || null,
        source: data.source || "Walk-in",
        notes: data.notes || null,
        status: "New",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return formatInquiry(inquiry);
  } catch (error) {
    console.error("Create inquiry error:", error);
    throw error;
  }
}

/**
 * List inquiries with role-based filtering
 */
async function listInquiries(filters = {}, user = null) {
  try {
    let query = supabase.from("leads").select("*");

    // Role-based filtering
    if (user) {
      if (user.role === "Super Admin") {
        // sees everything — no filter
      } else if (user.role === "Showroom Manager") {
        query = query.eq("showroom_id", user.showroomId);
      } else {
        // Sales Executive, Doc Officer, etc. — only assigned leads
        query = query.eq("assigned_to", user.uid);
      }
    }

    // Apply optional filters
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }
    if (filters.showroomId) {
      query = query.eq("showroom_id", filters.showroomId);
    }
    if (filters.source) {
      query = query.eq("source", filters.source);
    }
    if (filters.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    } else {
      // Default: only active leads
      query = query.eq("is_active", true);
    }

    // Date range filter
    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    // Search by customer name or mobile
    if (filters.search) {
      query = query.or(
        `customer_name.ilike.%${filters.search}%,mobile.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    return data.map(formatInquiry);
  } catch (error) {
    console.error("List inquiries error:", error);
    throw error;
  }
}

/**
 * Get a single inquiry with tasks and history
 */
async function getInquiry(inquiryId) {
  try {
    // Get the lead
    const { data: inquiry, error: inquiryError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (inquiryError) {
      if (inquiryError.code === "PGRST116") return null;
      throw inquiryError;
    }

    // Get tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("inquiry_tasks")
      .select("*")
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: false });

    if (tasksError) throw tasksError;

    // Get history
    const { data: history, error: historyError } = await supabase
      .from("inquiry_history")
      .select("*")
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: false });

    if (historyError) throw historyError;

    return {
      ...formatInquiry(inquiry),
      tasks: tasks.map(formatTask),
      history: history.map(formatHistory),
    };
  } catch (error) {
    console.error("Get inquiry error:", error);
    throw error;
  }
}

// ============================================================
// Status & Assignment
// ============================================================

/**
 * Update inquiry status with state machine validation
 */
async function updateInquiryStatus(inquiryId, newStatus, userId) {
  try {
    // Get current status
    const { data: current, error: getError } = await supabase
      .from("leads")
      .select("status")
      .eq("id", inquiryId)
      .single();

    if (getError) {
      if (getError.code === "PGRST116") {
        const err = new Error("Inquiry not found");
        err.statusCode = 404;
        err.code = "INQUIRY_NOT_FOUND";
        throw err;
      }
      throw getError;
    }

    // Validate transition
    validateTransition(current.status, newStatus);

    // Update status
    const { data, error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) throw error;

    // Log the status change in history
    await supabase.from("inquiry_history").insert({
      inquiry_id: inquiryId,
      type: "Status Change",
      summary: `Status changed from "${current.status}" to "${newStatus}"`,
      created_by: userId,
    });

    return formatInquiry(data);
  } catch (error) {
    console.error("Update inquiry status error:", error);
    throw error;
  }
}

/**
 * Assign inquiry to a sales executive
 */
async function assignInquiry(inquiryId, assignedToUserId, assignedByUserId) {
  try {
    // Verify the target user exists
    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("id", assignedToUserId)
      .single();

    if (userError || !targetUser) {
      const err = new Error("Target user not found");
      err.statusCode = 404;
      err.code = "USER_NOT_FOUND";
      throw err;
    }

    const { data, error } = await supabase
      .from("leads")
      .update({ assigned_to: assignedToUserId })
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) throw error;

    // Log assignment in history
    await supabase.from("inquiry_history").insert({
      inquiry_id: inquiryId,
      type: "Note",
      summary: `Assigned to ${targetUser.name} (${targetUser.role})`,
      created_by: assignedByUserId,
    });

    return formatInquiry(data);
  } catch (error) {
    console.error("Assign inquiry error:", error);
    throw error;
  }
}

// ============================================================
// Tasks
// ============================================================

/**
 * Create a follow-up task for an inquiry
 */
async function createTask(inquiryId, taskData, userId) {
  try {
    // Verify inquiry exists
    const { error: checkError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", inquiryId)
      .single();

    if (checkError) {
      const err = new Error("Inquiry not found");
      err.statusCode = 404;
      err.code = "INQUIRY_NOT_FOUND";
      throw err;
    }

    const { data, error } = await supabase
      .from("inquiry_tasks")
      .insert({
        inquiry_id: inquiryId,
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.dueDate || null,
        assigned_to: taskData.assignedTo || null,
        created_by: userId,
        status: "Pending",
      })
      .select()
      .single();

    if (error) throw error;

    return formatTask(data);
  } catch (error) {
    console.error("Create task error:", error);
    throw error;
  }
}

/**
 * Update a task (status, completion, etc.)
 */
async function updateTask(inquiryId, taskId, updates) {
  try {
    const allowedUpdates = {};

    if (updates.title) allowedUpdates.title = updates.title;
    if (updates.description !== undefined)
      allowedUpdates.description = updates.description;
    if (updates.dueDate) allowedUpdates.due_date = updates.dueDate;
    if (updates.assignedTo) allowedUpdates.assigned_to = updates.assignedTo;
    if (updates.status) {
      allowedUpdates.status = updates.status;
      if (updates.status === "Completed") {
        allowedUpdates.completed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("inquiry_tasks")
      .update(allowedUpdates)
      .eq("id", taskId)
      .eq("inquiry_id", inquiryId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const err = new Error("Task not found");
        err.statusCode = 404;
        err.code = "TASK_NOT_FOUND";
        throw err;
      }
      throw error;
    }

    return formatTask(data);
  } catch (error) {
    console.error("Update task error:", error);
    throw error;
  }
}

// ============================================================
// Communication History
// ============================================================

/**
 * Add a communication/activity entry to inquiry history
 */
async function addHistory(inquiryId, entry, userId) {
  try {
    // Verify inquiry exists
    const { error: checkError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", inquiryId)
      .single();

    if (checkError) {
      const err = new Error("Inquiry not found");
      err.statusCode = 404;
      err.code = "INQUIRY_NOT_FOUND";
      throw err;
    }

    const { data, error } = await supabase
      .from("inquiry_history")
      .insert({
        inquiry_id: inquiryId,
        type: entry.type,
        summary: entry.summary,
        details: entry.details || null,
        outcome: entry.outcome || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return formatHistory(data);
  } catch (error) {
    console.error("Add history error:", error);
    throw error;
  }
}

// ============================================================
// Inquiry-to-Booking Conversion
// ============================================================

/**
 * Convert an inquiry into a booking
 * Pre-fills customer data, creates booking, updates inquiry status
 */
async function convertToBooking(inquiryId, userId) {
  try {
    // Get the inquiry
    const { data: inquiry, error: getError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (getError) {
      const err = new Error("Inquiry not found");
      err.statusCode = 404;
      err.code = "INQUIRY_NOT_FOUND";
      throw err;
    }

    // Validate: must be in a convertible state
    const convertibleStatuses = [
      "Hot Lead",
      "Quotation Sent",
    ];
    if (!convertibleStatuses.includes(inquiry.status)) {
      const err = new Error(
        `Cannot convert inquiry with status "${inquiry.status}". Must be: ${convertibleStatuses.join(", ")}`
      );
      err.statusCode = 400;
      err.code = "INVALID_CONVERSION";
      throw err;
    }

    // Check if already converted
    if (inquiry.booking_id) {
      const err = new Error("Inquiry has already been converted to a booking");
      err.statusCode = 409;
      err.code = "ALREADY_CONVERTED";
      throw err;
    }

    // Create the booking from inquiry data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_name: inquiry.customer_name,
        email: inquiry.email,
        mobile: inquiry.mobile,
        vehicle_id: inquiry.vehicle_id,
        showroom_id: inquiry.showroom_id,
        booking_amount: 0, // Will be updated in the booking form
        status: "Pending",
        sales_executive_id: inquiry.assigned_to || userId,
        notes: `Converted from inquiry. Original source: ${inquiry.source || "N/A"}`,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Update inquiry: set status to "Booking Done" and store bookingId
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        status: "Booking Done",
        booking_id: booking.id,
      })
      .eq("id", inquiryId);

    if (updateError) throw updateError;

    // Log conversion in history
    await supabase.from("inquiry_history").insert({
      inquiry_id: inquiryId,
      type: "Status Change",
      summary: `Converted to booking ${booking.id}`,
      details: `Booking created with status "Pending"`,
      created_by: userId,
    });

    return {
      bookingId: booking.id,
      inquiryId,
      message: "Inquiry successfully converted to booking",
    };
  } catch (error) {
    console.error("Convert to booking error:", error);
    throw error;
  }
}

// ============================================================
// Soft Delete
// ============================================================

/**
 * Soft delete an inquiry
 */
async function deleteInquiry(inquiryId) {
  try {
    const { error } = await supabase
      .from("leads")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", inquiryId);

    if (error) throw error;

    return { success: true, message: "Inquiry deleted successfully" };
  } catch (error) {
    console.error("Delete inquiry error:", error);
    throw error;
  }
}

// ============================================================
// Formatters — snake_case DB → camelCase API
// ============================================================

function formatInquiry(row) {
  return {
    inquiryId: row.id,
    customerName: row.customer_name,
    email: row.email,
    mobile: row.mobile,
    address: row.address,
    vehicleId: row.vehicle_id,
    vehicleModel: row.vehicle_model,
    variantPreference: row.variant_preference,
    colorPreference: row.color_preference,
    budgetRange: row.budget_range,
    exchangeVehicle: row.exchange_vehicle,
    financeRequired: row.finance_required,
    showroomId: row.showroom_id,
    source: row.source,
    status: row.status,
    notes: row.notes,
    assignedTo: row.assigned_to,
    bookingId: row.booking_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatTask(row) {
  return {
    taskId: row.id,
    inquiryId: row.inquiry_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatHistory(row) {
  return {
    historyId: row.id,
    inquiryId: row.inquiry_id,
    type: row.type,
    summary: row.summary,
    details: row.details,
    outcome: row.outcome,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  TRANSITIONS,
  validateTransition,
  createInquiry,
  listInquiries,
  getInquiry,
  updateInquiryStatus,
  assignInquiry,
  createTask,
  updateTask,
  addHistory,
  convertToBooking,
  deleteInquiry,
};

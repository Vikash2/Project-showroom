const { supabase } = require("../config/supabase");
const { calculateGrandTotal } = require("./priceCalculationService");
const salesService = require("./salesService");

// ============================================================
// Booking Pipeline State Machine
// Validates that status transitions follow legal paths
// ============================================================
const BOOKING_TRANSITIONS = {
  "Pending": ["Confirmed", "Cancelled"],
  "Confirmed": ["Documentation In-Progress", "Cancelled"],
  "Documentation In-Progress": ["Stock Allocated"],
  "Stock Allocated": ["Payment Pending", "Pending Approval"],
  "Pending Approval": ["Sales Finalized", "Stock Allocated"], // after manager action
  "Sales Finalized": ["Payment Pending"],
  "Payment Pending": ["Payment Complete"],
  "Payment Complete": ["RTO Processing"],
  "RTO Processing": ["PDI Scheduled"],
  "PDI Scheduled": ["Ready for Delivery"],
  "Ready for Delivery": ["Delivered"],
  "Delivered": [],
  "Cancelled": [],
};

function validateBookingTransition(from, to) {
  // Allow staying in the same state (idempotent updates)
  if (from === to) {
    return;
  }
  
  const allowed = BOOKING_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    const error = new Error(`Invalid status transition: "${from}" → "${to}". Allowed: [${allowed.join(", ")}]`);
    error.statusCode = 400;
    error.code = "INVALID_TRANSITION";
    throw error;
  }
}

// ============================================================
// Service Logic Layer
// ============================================================

/**
 * Creates a new booking and automatically spawns a mapped "Sales" tracker entity.
 */
async function createBooking(data, userId) {
  try {
    console.log('[bookingService] Creating booking with data:', {
      customerName: data.customerName,
      mobile: data.mobile,
      vehicleId: data.vehicleId,
      variantId: data.variantId,
      colorId: data.colorId,
      showroomId: data.showroomId,
      bookingAmount: data.bookingAmount,
      userId: userId
    });

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        customer_name: data.customerName,
        email: data.email || null,
        mobile: data.mobile,
        vehicle_id: data.vehicleId,
        variant_id: data.variantId,
        color_id: data.colorId,
        showroom_id: data.showroomId,
        booking_amount: data.bookingAmount,
        status: "Pending",
        sales_executive_id: data.assignedTo || userId,
        notes: data.notes || null,
      })
      .select(`
        *,
        vehicles (id, brand, name, image_url),
        vehicle_variants (id, variant_name, price, specifications),
        vehicle_colors (id, color_name, color_code)
      `)
      .single();

    if (bookingErr) {
      console.error('[bookingService] Booking creation error:', bookingErr);
      throw bookingErr;
    }

    console.log('[bookingService] Booking created successfully:', booking.id);

    // Fetch live Base Pricing to freeze into the sale config
    const { data: variant, error: varError } = await supabase
      .from("vehicle_variants")
      .select("pricing")
      .eq("id", data.variantId)
      .single();

    // Auto-spawn the linked Sales document initialized explicitly
    const { error: salesErr } = await supabase
      .from("sales")
      .insert({
        booking_id: booking.id,
        customer_name: booking.customer_name,
        email: booking.email,
        mobile: booking.mobile,
        vehicle_id: booking.vehicle_id,
        variant_id: booking.variant_id,
        color_id: booking.color_id,
        showroom_id: booking.showroom_id,
        final_price: 0, // Will be computed when requested_discount/others are inserted
        status: "Processing",
        sales_executive_id: booking.sales_executive_id,
        base_pricing: !varError && variant ? variant.pricing : {},
      });

    if (salesErr) {
      console.warn("Booking created, but link to Sales table failed.", salesErr);
    }

    return formatBooking(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    throw error;
  }
}

/**
 * Fetch lists applying filtered Access boundaries.
 */
async function listBookings(filters = {}, user) {
  try {
    let query = supabase.from("bookings").select(`
      *,
      sales (*),
      vehicles (id, brand, name, image_url),
      vehicle_variants (id, variant_name, price, specifications),
      vehicle_colors (id, color_name, color_code)
    `);

    if (user.role === "Super Admin") {
      // Sees everything
    } else if (user.role === "Showroom Manager") {
      query = query.eq("showroom_id", user.showroomId);
    } else {
      query = query.eq("sales_executive_id", user.uid);
    }

    // Parameters
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.showroomId) query = query.eq("showroom_id", filters.showroomId);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return data.map((b) => ({
      ...formatBooking(b),
      sale: b.sales && b.sales.length > 0 ? formatSale(b.sales[0]) : null,
    }));
  } catch (error) {
    console.error("List Bookings Error:", error);
    throw error;
  }
}

/**
 * Process a pipeline status advancement
 */
async function updateBookingStatus(id, newStatus) {
  try {
    const { data: current, error: getErr } = await supabase
      .from("bookings")
      .select("status")
      .eq("id", id)
      .single();

    if (getErr) throw getErr;

    validateBookingTransition(current.status, newStatus);

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return formatBooking(data);
  } catch (error) {
    throw error;
  }
}

/**
 * Bind stock constraint (Chassis tracking) to a booking
 */
async function assignChassis(id, chassisNumber, engineNumber) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ chassis_number: chassisNumber, engine_number: engineNumber })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Postgres Unique Constraint code
        const err = new Error("Chassis/Engine number already assigned to another booking");
        err.statusCode = 409;
        throw err;
      }
      throw error;
    }

    return formatBooking(data);
  } catch (error) {
    throw error;
  }
}

// ============================================================
// Sales Pipeline Operations
// ============================================================

/**
 * Request manager approval for special discounting.
 */
async function requestApproval(id, discountAmount, userId) {
  try {
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("status")
      .eq("id", id)
      .single();

    if (bErr || !booking) throw bErr;
    if (booking.payment_confirmed) throw new Error("Cannot edit after payment confirmed");

    validateBookingTransition(booking.status, "Pending Approval");

    // Phase 1: Update status of Booking correctly 
    await supabase.from("bookings").update({ status: "Pending Approval" }).eq("id", id);

    // Phase 2: Insert Approval payload into Sales tracker mapping
    const { data, error } = await supabase
      .from("sales")
      .update({
        special_discount: discountAmount,
        special_discount_status: "Pending",
        requested_by: userId,
      })
      .eq("booking_id", id)
      .select()
      .single();

    if (error) throw error;
    return formatSale(data);
  } catch (error) {
    throw error;
  }
}

/**
 * Approve or Reject the requested discount. Requires 'Super Admin' or 'Showroom Manager'.
 */
async function handleApproval(id, isApproved, userId, reason = "") {
  try {
    const statusResult = isApproved ? "Sales Finalized" : "Stock Allocated"; // Jump back to Allocated if rejected

    await supabase.from("bookings").update({ status: statusResult }).eq("id", id);
    
    let saleUpdates = {
      special_discount_status: isApproved ? "Approved" : "Rejected",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    };
    if (!isApproved && reason) {
      saleUpdates.rejection_reason = reason;
      // Depending on logic, setting discount to 0 on reject to clear the map.
      saleUpdates.special_discount = 0;
    }

    const { data: sale, error } = await supabase
      .from("sales")
      .update(saleUpdates)
      .eq("booking_id", id)
      .select()
      .single();
    if (error) throw error;

    // Recalculate price live
    const total = calculateGrandTotal(sale.base_pricing, {
      ...sale,
      specialDiscountStatus: saleUpdates.special_discount_status
    });

    await supabase.from("sales").update({ final_price: total }).eq("id", sale.id);

    return sale;
  } catch (error) {
    throw error;
  }
}

// ============================================================
// Payment & Delivery
// ============================================================

async function addPayment(id, payload, userId) {
  try {
    const { data, error } = await supabase
      .from("booking_payments")
      .insert({
        booking_id: id,
        amount: payload.amount,
        payment_method: payload.paymentMethod,
        transaction_reference: payload.reference || null,
        status: "Completed",
        collected_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Lock the booking entirely confirming finalization.
 */
async function confirmDelivery(id, userId, deliveryNotes = null) {
  try {
    // 1. Get booking and sales data
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("*, sales(*)")
      .eq("id", id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate: Must have a sale
    if (!booking.sales || booking.sales.length === 0) {
      const error = new Error("No sale found for this booking. Cannot deliver without a finalized sale.");
      error.statusCode = 400;
      throw error;
    }

    const sale = booking.sales[0];

    // 3. Validate: Payment must be complete
    // Check multiple indicators for payment completion
    const isPaymentComplete = 
      sale.payment_status === "Completed" ||
      booking.payment_confirmed === true ||
      sale.status === "Payment Complete";
    
    if (!isPaymentComplete) {
      console.error('[confirmDelivery] Payment not complete:', {
        saleId: sale.id,
        paymentStatus: sale.payment_status,
        bookingPaymentConfirmed: booking.payment_confirmed,
        saleStatus: sale.status
      });
      const error = new Error("Payment must be completed before delivery");
      error.statusCode = 400;
      throw error;
    }

    // 4. Validate: Not already delivered
    if (sale.delivery_confirmed) {
      const error = new Error("Vehicle already delivered");
      error.statusCode = 400;
      throw error;
    }

    // 5. ✅ CORRECT: Update SALES table (delivery is part of sales lifecycle)
    const { data: updatedSale, error: saleErr } = await supabase
      .from("sales")
      .update({
        status: "Delivered",
        delivery_status: "Delivered",
        delivery_confirmed: true,
        delivered_at: new Date().toISOString(),
        delivered_by: userId,
        delivery_notes: deliveryNotes,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sale.id)
      .select()
      .single();

    if (saleErr) throw saleErr;

    // 6. Update booking status for reference/reporting only
    const { error: bookingErr } = await supabase
      .from("bookings")
      .update({ 
        status: "Delivered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (bookingErr) throw bookingErr;

    return {
      success: true,
      sale: updatedSale,
      booking: { ...booking, status: "Delivered" },
      message: "Vehicle delivered successfully",
    };
  } catch (error) {
    console.error("Confirm delivery error:", error);
    throw error;
  }
}

// ============================================================
// Formatters
// ============================================================

function formatBooking(row) {
  if (!row) return null;
  return {
    bookingId: row.id,
    customerName: row.customer_name,
    email: row.email,
    mobile: row.mobile,
    vehicleId: row.vehicle_id,
    variantId: row.variant_id,
    colorId: row.color_id,
    showroomId: row.showroom_id,
    bookingAmount: row.booking_amount,
    status: row.status,
    chassisNumber: row.chassis_number,
    engineNumber: row.engine_number,
    paymentConfirmed: row.payment_confirmed,
    deliveryDate: row.delivery_date,
    notes: row.notes,
    assignedTo: row.sales_executive_id,
    createdAt: row.created_at,
    // Include vehicle details if available
    vehicle: row.vehicles ? {
      id: row.vehicles.id,
      brand: row.vehicles.brand,
      model: row.vehicles.name, // Database column is 'name', but frontend expects 'model'
      image: row.vehicles.image_url,
    } : null,
    variant: row.vehicle_variants ? {
      id: row.vehicle_variants.id,
      name: row.vehicle_variants.variant_name,
      pricing: row.vehicle_variants.specifications?.pricing || row.vehicle_variants.specifications || {},
    } : null,
    color: row.vehicle_colors ? {
      id: row.vehicle_colors.id,
      name: row.vehicle_colors.color_name,
      hexCode: row.vehicle_colors.color_code,
    } : null,
  };
}

function formatSale(row) {
  if (!row) return null;
  return {
    saleId: row.id,
    bookingId: row.booking_id,
    finalPrice: row.final_price,
    basePricing: row.base_pricing,
    requestedDiscount: row.requested_discount,
    specialDiscount: row.special_discount,
    specialDiscountStatus: row.special_discount_status,
    otherCharges: row.other_charges,
    accessories: row.accessories,
    status: row.status,
  };
}

module.exports = {
  createBooking,
  listBookings,
  updateBookingStatus,
  assignChassis,
  requestApproval,
  handleApproval,
  addPayment,
  confirmDelivery,
};

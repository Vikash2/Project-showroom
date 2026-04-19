const { supabase } = require("../config/supabase");

// ============================================================
// Actual DB columns in 'sales' table:
// id, booking_id, customer_name, email, mobile,
// vehicle_id, variant_id, color_id, showroom_id,
// final_price, accessories, payment_method, payment_status,
// sales_executive_id, documents, status, created_at,
// updated_at, completed_at, requested_discount,
// special_discount, special_discount_status, requested_by,
// approved_by, approved_at, rejection_reason,
// transaction_reference, base_pricing, other_charges
// ============================================================

/**
 * Build the sale_details JSON blob from frontend FinalSale payload.
 * All fields that don't have a dedicated DB column are stored here.
 */
function buildSaleDetails(saleData) {
  return {
    soldThrough: saleData.soldThrough || "CASH",
    typeOfSale: saleData.typeOfSale || "NEW",
    registration: saleData.registration || "Yes",
    insurance: saleData.insurance || "NO",
    insuranceType: saleData.insuranceType || null,
    insuranceNominee: saleData.insuranceNominee || null,
    hypothecationSelected: saleData.hypothecationSelected || "No",
    hypothecationCharge: saleData.hypothecationCharge || 0,
    otherState: saleData.otherState || { selected: "", amount: 0 },
    financer: saleData.financer || null,
    financeBy: saleData.financeBy || null,
    exchange: saleData.exchange || null,
    selectedAccessoriesFinal: saleData.selectedAccessoriesFinal || {},
    accessoriesTotal: saleData.accessoriesTotal || 0,
    discount: saleData.discount || 0,
    specialDiscount: saleData.specialDiscount || 0,
    specialDiscountApprovalStatus: saleData.specialDiscountApprovalStatus || "None",
    isGstNumber: saleData.isGstNumber || "NO",
    gstNumber: saleData.gstNumber || null,
    jobClub: saleData.jobClub || "NO",
    otherChargesAmount: saleData.otherCharges || 0,
    documents: saleData.documents || null,
  };
}

/**
 * Determine the new status based on sale data
 */
function determineSaleStatus(saleData) {
  if (
    saleData.specialDiscount > 0 &&
    saleData.specialDiscountApprovalStatus !== "Approved"
  ) {
    return "Pending Approval";
  }
  return "Sales Finalized";
}

/**
 * Create a direct sale (without booking)
 * Called when sales executive creates a sale directly
 */
async function createDirectSale(saleData, salesExecutiveId, showroomId) {
  try {
    // Validate required fields for direct sale
    if (!saleData.customerName || !saleData.mobile) {
      const error = new Error("Customer name and mobile are required");
      error.statusCode = 400;
      throw error;
    }

    if (!saleData.vehicleId || !saleData.variantId || !saleData.colorId) {
      const error = new Error("Vehicle, variant, and color are required");
      error.statusCode = 400;
      throw error;
    }

    if (!showroomId) {
      const error = new Error("Showroom ID is required");
      error.statusCode = 400;
      throw error;
    }

    const newStatus = determineSaleStatus(saleData);
    const saleDetails = buildSaleDetails(saleData);

    // Create sale without booking_id
    const { data: sale, error: saleErr } = await supabase
      .from("sales")
      .insert({
        booking_id: null, // Direct sale has no booking
        showroom_id: showroomId,
        vehicle_id: saleData.vehicleId,
        variant_id: saleData.variantId,
        color_id: saleData.colorId,
        customer_name: saleData.customerName,
        email: saleData.email || null,
        mobile: saleData.mobile,
        sales_executive_id: salesExecutiveId,
        base_pricing: saleData.basePricing || {},
        final_price: saleData.finalPrice || 0,
        requested_discount: saleData.discount || 0,
        special_discount: saleData.specialDiscount || 0,
        special_discount_status: saleData.specialDiscountApprovalStatus || "None",
        accessories: saleData.accessories || [],
        other_charges: saleDetails, // store full sale details as JSON
        payment_status: "Pending",
        status: newStatus,
      })
      .select()
      .single();

    if (saleErr) {
      console.error("[salesService] Insert error:", saleErr);
      throw saleErr;
    }

    return {
      success: true,
      sale: formatSale(sale),
      message: "Direct sale created successfully",
    };
  } catch (error) {
    console.error("Create direct sale error:", error);
    throw error;
  }
}

/**
 * Create or update a sale record from booking.
 * Called when sales executive finalizes all details.
 */
async function createSaleFromBooking(bookingId, saleData, salesExecutiveId) {
  try {
    // Get booking details
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr) throw bookingErr;
    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if sale already exists
    const { data: existingSale } = await supabase
      .from("sales")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existingSale) {
      return await updateSale(existingSale.id, saleData, salesExecutiveId);
    }

    const newStatus = determineSaleStatus(saleData);
    const saleDetails = buildSaleDetails(saleData);

    // Only insert columns that actually exist in the DB
    const { data: sale, error: saleErr } = await supabase
      .from("sales")
      .insert({
        booking_id: bookingId,
        showroom_id: booking.showroom_id,
        vehicle_id: booking.vehicle_id,
        variant_id: booking.variant_id,
        color_id: booking.color_id,
        customer_name: booking.customer_name,
        email: booking.email,
        mobile: booking.mobile,
        sales_executive_id: salesExecutiveId || booking.sales_executive_id,
        base_pricing: saleData.basePricing || {},
        final_price: saleData.finalPrice || 0,
        requested_discount: saleData.discount || 0,
        special_discount: saleData.specialDiscount || 0,
        special_discount_status: saleData.specialDiscountApprovalStatus || "None",
        accessories: saleData.accessories || [],
        other_charges: saleDetails, // store full sale details as JSON
        payment_status: "Pending",
        status: newStatus,
      })
      .select()
      .single();

    if (saleErr) {
      console.error("[salesService] Insert error:", saleErr);
      throw saleErr;
    }

    // Update booking status to match
    await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    return {
      success: true,
      sale: formatSale(sale),
      message: "Sale created successfully",
    };
  } catch (error) {
    console.error("Create sale error:", error);
    throw error;
  }
}

/**
 * Update an existing sale
 */
async function updateSale(saleId, saleData, userId) {
  try {
    const { data: existingSale, error: fetchErr } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (fetchErr) throw fetchErr;
    if (!existingSale) {
      const error = new Error("Sale not found");
      error.statusCode = 404;
      throw error;
    }

    if (existingSale.payment_status === "Completed") {
      const error = new Error("Cannot update sale after payment is confirmed");
      error.statusCode = 400;
      throw error;
    }

    const newStatus = determineSaleStatus(saleData);
    const saleDetails = buildSaleDetails(saleData);

    const { data: sale, error: updateErr } = await supabase
      .from("sales")
      .update({
        base_pricing: saleData.basePricing || existingSale.base_pricing,
        final_price: saleData.finalPrice ?? existingSale.final_price,
        requested_discount: saleData.discount ?? existingSale.requested_discount,
        special_discount: saleData.specialDiscount ?? existingSale.special_discount,
        special_discount_status: saleData.specialDiscountApprovalStatus ?? existingSale.special_discount_status,
        accessories: saleData.accessories ?? existingSale.accessories,
        other_charges: saleDetails, // store full sale details as JSON
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (updateErr) {
      console.error("[salesService] Update error:", updateErr);
      throw updateErr;
    }

    // Update booking status
    if (existingSale.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", existingSale.booking_id);
    }

    return {
      success: true,
      sale: formatSale(sale),
      message: "Sale updated successfully",
    };
  } catch (error) {
    console.error("Update sale error:", error);
    throw error;
  }
}

/**
 * Approve special discount
 */
async function approveSpecialDiscount(saleId, approverId) {
  try {
    const { data: sale, error } = await supabase
      .from("sales")
      .update({
        special_discount_status: "Approved",
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        status: "Sales Finalized",
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (error) throw error;

    if (sale.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "Sales Finalized" })
        .eq("id", sale.booking_id);
    }

    return {
      success: true,
      sale: formatSale(sale),
      message: "Special discount approved successfully",
    };
  } catch (error) {
    console.error("Approve special discount error:", error);
    throw error;
  }
}

/**
 * Reject special discount
 */
async function rejectSpecialDiscount(saleId, reason) {
  try {
    const { data: sale, error } = await supabase
      .from("sales")
      .update({
        special_discount_status: "Rejected",
        rejection_reason: reason,
        status: "Pending Approval",
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      sale: formatSale(sale),
      message: "Special discount rejected",
    };
  } catch (error) {
    console.error("Reject special discount error:", error);
    throw error;
  }
}

/**
 * Get sale by ID
 */
async function getSale(saleId) {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return formatSale(data);
  } catch (error) {
    console.error("Get sale error:", error);
    throw error;
  }
}

/**
 * Get sale by booking ID
 */
async function getSaleByBookingId(bookingId) {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return formatSale(data);
  } catch (error) {
    console.error("Get sale by booking error:", error);
    throw error;
  }
}

/**
 * List sales with filters
 */
async function listSales(filters = {}, user) {
  try {
    let query = supabase.from("sales").select("*");

    if (user.role !== "Super Admin") {
      query = query.eq("showroom_id", user.showroomId);
    }

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
    if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
    if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(formatSale);
  } catch (error) {
    console.error("List sales error:", error);
    throw error;
  }
}

/**
 * Transfer sale to cashier
 */
async function transferToCashier(saleId, salesExecutiveId) {
  try {
    const { data: sale, error: fetchErr } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (fetchErr) throw fetchErr;
    if (!sale) {
      const error = new Error("Sale not found");
      error.statusCode = 404;
      throw error;
    }

    if (sale.status !== "Sales Finalized") {
      const error = new Error("Sale must be finalized before transferring to cashier");
      error.statusCode = 400;
      throw error;
    }

    const { data: updatedSale, error: updateErr } = await supabase
      .from("sales")
      .update({
        status: "Ready for Payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    if (sale.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "Ready for Payment" })
        .eq("id", sale.booking_id);
    }

    return {
      success: true,
      sale: formatSale(updatedSale),
      message: "Sale transferred to cashier successfully",
    };
  } catch (error) {
    console.error("Transfer to cashier error:", error);
    throw error;
  }
}

// ============================================================
// Formatter — maps DB row → frontend-expected shape
// other_charges column stores the full FinalSale details JSON
// ============================================================
function formatSale(row) {
  if (!row) return null;

  // other_charges stores the full sale details blob
  const details = row.other_charges || {};

  return {
    id: row.id,
    bookingId: row.booking_id,
    showroomId: row.showroom_id,
    vehicleId: row.vehicle_id,
    variantId: row.variant_id,
    colorId: row.color_id,
    customerName: row.customer_name,
    email: row.email,
    mobile: row.mobile,
    salesExecutiveId: row.sales_executive_id,

    // Pricing
    basePricing: row.base_pricing || {},
    finalPrice: row.final_price || 0,
    requestedDiscount: row.requested_discount || 0,
    specialDiscount: row.special_discount || 0,
    specialDiscountStatus: row.special_discount_status || "None",
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,

    // Accessories
    accessories: row.accessories || [],

    // Payment
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    transactionReference: row.transaction_reference,

    // Delivery (✅ NEW: Added delivery tracking from sales table)
    deliveryStatus: row.delivery_status || 'Pending',
    deliveryConfirmed: row.delivery_confirmed || false,
    deliveredAt: row.delivered_at,
    deliveredBy: row.delivered_by,
    deliveryNotes: row.delivery_notes,

    // Status
    status: row.status,

    // Timestamps
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,

    // Full sale details (stored in other_charges column)
    soldThrough: details.soldThrough || "CASH",
    typeOfSale: details.typeOfSale || "NEW",
    registration: details.registration || "Yes",
    insurance: details.insurance || "NO",
    insuranceType: details.insuranceType || null,
    insuranceNominee: details.insuranceNominee || null,
    hypothecationSelected: details.hypothecationSelected || "No",
    hypothecationCharge: details.hypothecationCharge || 0,
    otherState: details.otherState || { selected: "", amount: 0 },
    financer: details.financer || null,
    financeBy: details.financeBy || null,
    exchange: details.exchange || null,
    selectedAccessoriesFinal: details.selectedAccessoriesFinal || {},
    accessoriesTotal: details.accessoriesTotal || 0,
    discount: details.discount || 0,
    specialDiscountApprovalStatus: details.specialDiscountApprovalStatus || "None",
    isGstNumber: details.isGstNumber || "NO",
    gstNumber: details.gstNumber || null,
    jobClub: details.jobClub || "NO",
    otherChargesAmount: details.otherChargesAmount || 0,
    
    // Documents (stored in documents column)
    documents: row.documents || {
      aadharCard: {},
      panCard: {},
      drivingLicense: {},
      addressProof: {},
      passportPhotos: {}
    },
  };
}

module.exports = {
  createDirectSale,
  createSaleFromBooking,
  updateSale,
  approveSpecialDiscount,
  rejectSpecialDiscount,
  getSale,
  getSaleByBookingId,
  listSales,
  transferToCashier,
};

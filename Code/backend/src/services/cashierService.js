const { supabase } = require("../config/supabase");

/**
 * Collect payment from customer
 * Works with both booking-based and direct sales
 */
async function collectPayment(saleId, paymentData, cashierId) {
  try {
    const { amount, paymentMethod, transactionReference, notes } = paymentData;

    // Get sale details
    const { data: sale, error: saleErr } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (saleErr) throw saleErr;
    if (!sale) {
      const error = new Error("Sale not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if payment already confirmed
    if (sale.payment_status === "Completed") {
      const error = new Error("Payment already confirmed for this sale");
      error.statusCode = 400;
      throw error;
    }

    // Generate receipt number
    const { data: receiptNumberData } = await supabase.rpc("generate_receipt_number");
    const receiptNumber = receiptNumberData || `MR-${Date.now()}`;

    // Create money receipt
    const { data: receipt, error: receiptErr } = await supabase
      .from("money_receipts")
      .insert({
        receipt_number: receiptNumber,
        booking_id: sale.booking_id, // May be null for direct sales
        sale_id: saleId,
        customer_name: sale.customer_name,
        amount,
        payment_method: paymentMethod,
        transaction_reference: transactionReference,
        issued_by: cashierId,
        notes,
      })
      .select()
      .single();

    if (receiptErr) throw receiptErr;

    // Update sales table
    const { error: updateSaleErr } = await supabase
      .from("sales")
      .update({
        cashier_id: cashierId,
        money_receipt_number: receiptNumber,
        amount_paid: amount,
        payment_status: "Pending", // Still pending until confirmed
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId);

    if (updateSaleErr) throw updateSaleErr;

    // If there's a booking, update it too
    if (sale.booking_id) {
      await supabase
        .from("bookings")
        .update({
          cashier_id: cashierId,
          payment_collected_at: new Date().toISOString(),
          money_receipt_number: receiptNumber,
          money_receipt_issued_at: new Date().toISOString(),
        })
        .eq("id", sale.booking_id);
    }

    return {
      success: true,
      receipt: formatReceipt(receipt),
      message: "Payment collected successfully",
    };
  } catch (error) {
    console.error("Collect payment error:", error);
    throw error;
  }
}

/**
 * Confirm payment and lock the sale
 * Works with both booking-based and direct sales
 */
async function confirmPayment(saleId, cashierId) {
  try {
    // Get sale details
    const { data: sale, error: saleErr } = await supabase
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (saleErr) throw saleErr;
    if (!sale) {
      const error = new Error("Sale not found");
      error.statusCode = 404;
      throw error;
    }

    if (!sale.money_receipt_number) {
      const error = new Error("No payment receipt found. Please collect payment first.");
      error.statusCode = 400;
      throw error;
    }

    // Confirm payment in sales table
    const { data: updatedSale, error: updateErr } = await supabase
      .from("sales")
      .update({
        payment_status: "Completed",
        status: "Payment Complete",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // If there's a booking, update it too
    if (sale.booking_id) {
      await supabase
        .from("bookings")
        .update({
          payment_confirmed: true,
          status: "Payment Complete",
        })
        .eq("id", sale.booking_id);
    }

    return {
      success: true,
      sale: formatSale(updatedSale),
      message: "Payment confirmed successfully",
    };
  } catch (error) {
    console.error("Confirm payment error:", error);
    throw error;
  }
}

function formatSale(row) {
  if (!row) return null;
  
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
    basePricing: row.base_pricing || {},
    finalPrice: row.final_price || 0,
    paymentStatus: row.payment_status,
    status: row.status,
    cashierId: row.cashier_id,
    moneyReceiptNumber: row.money_receipt_number,
    taxInvoiceNumber: row.tax_invoice_number,
    amountPaid: row.amount_paid || 0,
    deliveryStatus: row.delivery_status || 'Pending',
    deliveryConfirmed: row.delivery_confirmed || false,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

/**
 * Approve tax invoice
 * Works with both booking-based and direct sales
 */
async function approveTaxInvoice(saleId, cashierId) {
  try {
    // Get sale details with related data
    const { data: sale, error: saleErr } = await supabase
      .from("sales")
      .select(`
        *,
        vehicles (*),
        vehicle_variants (*),
        vehicle_colors (*)
      `)
      .eq("id", saleId)
      .single();

    if (saleErr) throw saleErr;
    if (!sale) {
      const error = new Error("Sale not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if payment is confirmed
    if (sale.payment_status !== "Completed") {
      const error = new Error("Payment must be confirmed before approving invoice");
      error.statusCode = 400;
      throw error;
    }

    // Generate invoice number
    const { data: invoiceNumberData } = await supabase.rpc("generate_invoice_number");
    const invoiceNumber = invoiceNumberData || `INV-${Date.now()}`;

    const details = sale.other_charges || {};

    // Create tax invoice
    const { data: invoice, error: invoiceErr } = await supabase
      .from("tax_invoices")
      .insert({
        invoice_number: invoiceNumber,
        booking_id: sale.booking_id, // May be null for direct sales
        sale_id: saleId,
        customer_name: sale.customer_name,
        customer_address: details.customerAddress || "",
        customer_mobile: sale.mobile,
        customer_email: sale.email,
        gst_number: details.gstNumber || null,
        vehicle_details: {
          vehicle_id: sale.vehicle_id,
          variant_id: sale.variant_id,
          color_id: sale.color_id,
          chassis_number: details.chassisNumber || null,
          engine_number: details.engineNumber || null,
        },
        pricing_breakdown: sale.base_pricing || {},
        total_amount: sale.final_price || 0,
        approved_by: cashierId,
      })
      .select()
      .single();

    if (invoiceErr) throw invoiceErr;

    // Update sales table
    const { error: updateSaleErr } = await supabase
      .from("sales")
      .update({
        tax_invoice_number: invoiceNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId);

    if (updateSaleErr) throw updateSaleErr;

    // If there's a booking, update it too
    if (sale.booking_id) {
      await supabase
        .from("bookings")
        .update({
          tax_invoice_number: invoiceNumber,
          tax_invoice_approved_by: cashierId,
          tax_invoice_approved_at: new Date().toISOString(),
        })
        .eq("id", sale.booking_id);
    }

    return {
      success: true,
      invoice: formatInvoice(invoice),
      message: "Tax invoice approved successfully",
    };
  } catch (error) {
    console.error("Approve tax invoice error:", error);
    throw error;
  }
}

/**
 * Hold insurance or registration due to pending dues
 */
async function holdService(bookingId, serviceType, reason, cashierId) {
  try {
    const updates = {
      hold_reason: reason,
    };

    if (serviceType === "insurance") {
      updates.insurance_on_hold = true;
    } else if (serviceType === "registration") {
      updates.registration_on_hold = true;
    } else {
      const error = new Error("Invalid service type. Must be 'insurance' or 'registration'");
      error.statusCode = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      booking: formatBooking(data),
      message: `${serviceType} placed on hold successfully`,
    };
  } catch (error) {
    console.error("Hold service error:", error);
    throw error;
  }
}

/**
 * Release hold on insurance or registration
 */
async function releaseHold(bookingId, serviceType, cashierId) {
  try {
    const updates = {
      hold_reason: null,
    };

    if (serviceType === "insurance") {
      updates.insurance_on_hold = false;
    } else if (serviceType === "registration") {
      updates.registration_on_hold = false;
    } else {
      const error = new Error("Invalid service type. Must be 'insurance' or 'registration'");
      error.statusCode = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      booking: formatBooking(data),
      message: `${serviceType} hold released successfully`,
    };
  } catch (error) {
    console.error("Release hold error:", error);
    throw error;
  }
}

/**
 * Get money receipt by ID or receipt number
 */
async function getReceipt(identifier) {
  try {
    let query = supabase.from("money_receipts").select("*");

    // Check if identifier is UUID or receipt number
    if (identifier.includes("-") && identifier.length > 20) {
      query = query.eq("id", identifier);
    } else {
      query = query.eq("receipt_number", identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return formatReceipt(data);
  } catch (error) {
    console.error("Get receipt error:", error);
    throw error;
  }
}

/**
 * Get tax invoice by ID or invoice number
 */
async function getInvoice(identifier) {
  try {
    let query = supabase.from("tax_invoices").select("*");

    // Check if identifier is UUID or invoice number
    if (identifier.includes("-") && identifier.length > 20) {
      query = query.eq("id", identifier);
    } else {
      query = query.eq("invoice_number", identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return formatInvoice(data);
  } catch (error) {
    console.error("Get invoice error:", error);
    throw error;
  }
}

/**
 * List all receipts for a showroom
 */
async function listReceipts(filters = {}, user) {
  try {
    let query = supabase.from("money_receipts").select(`
      *,
      bookings (
        showroom_id,
        customer_name,
        mobile
      )
    `);

    // Apply role-based filtering
    if (user.role !== "Super Admin") {
      query = query.eq("bookings.showroom_id", user.showroomId);
    }

    if (filters.bookingId) {
      query = query.eq("booking_id", filters.bookingId);
    }

    if (filters.dateFrom) {
      query = query.gte("issued_at", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("issued_at", filters.dateTo);
    }

    const { data, error } = await query.order("issued_at", { ascending: false });

    if (error) throw error;

    return data.map(formatReceipt);
  } catch (error) {
    console.error("List receipts error:", error);
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
    cashierId: row.cashier_id,
    moneyReceiptNumber: row.money_receipt_number,
    taxInvoiceNumber: row.tax_invoice_number,
    insuranceOnHold: row.insurance_on_hold,
    registrationOnHold: row.registration_on_hold,
    holdReason: row.hold_reason,
    createdAt: row.created_at,
  };
}

function formatReceipt(row) {
  if (!row) return null;
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    bookingId: row.booking_id,
    saleId: row.sale_id,
    customerName: row.customer_name,
    amount: row.amount,
    paymentMethod: row.payment_method,
    transactionReference: row.transaction_reference,
    issuedBy: row.issued_by,
    issuedAt: row.issued_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function formatInvoice(row) {
  if (!row) return null;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    bookingId: row.booking_id,
    saleId: row.sale_id,
    customerName: row.customer_name,
    customerAddress: row.customer_address,
    customerMobile: row.customer_mobile,
    customerEmail: row.customer_email,
    gstNumber: row.gst_number,
    vehicleDetails: row.vehicle_details,
    pricingBreakdown: row.pricing_breakdown,
    totalAmount: row.total_amount,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    generatedAt: row.generated_at,
    createdAt: row.created_at,
  };
}

module.exports = {
  collectPayment,
  confirmPayment,
  approveTaxInvoice,
  holdService,
  releaseHold,
  getReceipt,
  getInvoice,
  listReceipts,
};

const { supabase } = require("../config/supabase");

/**
 * Update delivery status for a sale
 */
async function updateDeliveryStatus(saleId, status, userId) {
  try {
    const validStatuses = ['Pending', 'Ready', 'In Transit', 'Delivered'];
    
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

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

    // Check if payment is completed
    if (sale.payment_status !== "Completed") {
      const error = new Error("Payment must be completed before updating delivery status");
      error.statusCode = 400;
      throw error;
    }

    const updates = {
      delivery_status: status,
      updated_at: new Date().toISOString(),
    };

    // If status is Delivered, mark as confirmed
    if (status === 'Delivered') {
      updates.delivery_confirmed = true;
      updates.delivered_at = new Date().toISOString();
      updates.delivered_by = userId;
      updates.status = 'Delivered';
    }

    const { data: updatedSale, error: updateErr } = await supabase
      .from("sales")
      .update(updates)
      .eq("id", saleId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return {
      success: true,
      sale: formatSale(updatedSale),
      message: `Delivery status updated to ${status}`,
    };
  } catch (error) {
    console.error("Update delivery status error:", error);
    throw error;
  }
}

/**
 * Confirm delivery for a sale
 */
async function confirmDelivery(saleId, deliveryData, userId) {
  try {
    const { notes } = deliveryData;

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

    // Check if payment is completed
    if (sale.payment_status !== "Completed") {
      const error = new Error("Payment must be completed before confirming delivery");
      error.statusCode = 400;
      throw error;
    }

    // Check if already delivered
    if (sale.delivery_confirmed) {
      const error = new Error("Delivery already confirmed for this sale");
      error.statusCode = 400;
      throw error;
    }

    const { data: updatedSale, error: updateErr } = await supabase
      .from("sales")
      .update({
        delivery_status: 'Delivered',
        delivery_confirmed: true,
        delivered_at: new Date().toISOString(),
        delivered_by: userId,
        delivery_notes: notes || null,
        status: 'Delivered',
        updated_at: new Date().toISOString(),
      })
      .eq("id", saleId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return {
      success: true,
      sale: formatSale(updatedSale),
      message: "Delivery confirmed successfully",
    };
  } catch (error) {
    console.error("Confirm delivery error:", error);
    throw error;
  }
}

/**
 * Get delivery details for a sale
 */
async function getDeliveryDetails(saleId) {
  try {
    const { data: sale, error } = await supabase
      .from("sales")
      .select(`
        id,
        delivery_status,
        delivery_confirmed,
        delivered_at,
        delivered_by,
        delivery_notes,
        customer_name,
        mobile,
        vehicle_id,
        status
      `)
      .eq("id", saleId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const notFoundError = new Error("Sale not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }

    return {
      success: true,
      delivery: {
        saleId: sale.id,
        status: sale.delivery_status,
        confirmed: sale.delivery_confirmed,
        deliveredAt: sale.delivered_at,
        deliveredBy: sale.delivered_by,
        notes: sale.delivery_notes,
        customerName: sale.customer_name,
        mobile: sale.mobile,
        vehicleId: sale.vehicle_id,
        saleStatus: sale.status,
      },
    };
  } catch (error) {
    console.error("Get delivery details error:", error);
    throw error;
  }
}

/**
 * List all deliveries with filters
 */
async function listDeliveries(filters = {}, user) {
  try {
    let query = supabase
      .from("sales")
      .select("*")
      .neq("delivery_status", "Pending"); // Only show sales in delivery process

    // Apply role-based filtering
    if (user.role !== "Super Admin") {
      query = query.eq("showroom_id", user.showroomId);
    }

    if (filters.status) {
      query = query.eq("delivery_status", filters.status);
    }

    if (filters.confirmed !== undefined) {
      query = query.eq("delivery_confirmed", filters.confirmed);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(formatSale);
  } catch (error) {
    console.error("List deliveries error:", error);
    throw error;
  }
}

// ============================================================
// Formatter
// ============================================================

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
    
    // Delivery fields
    deliveryStatus: row.delivery_status || 'Pending',
    deliveryConfirmed: row.delivery_confirmed || false,
    deliveredAt: row.delivered_at,
    deliveredBy: row.delivered_by,
    deliveryNotes: row.delivery_notes,
    
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

module.exports = {
  updateDeliveryStatus,
  confirmDelivery,
  getDeliveryDetails,
  listDeliveries,
};

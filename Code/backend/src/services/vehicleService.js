const { supabase } = require("../config/supabase");

/**
 * Create a new vehicle
 */
async function createVehicle(vehicleData) {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        ...vehicleData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Create vehicle error:", error);
    throw error;
  }
}

/**
 * List all vehicles with optional filters
 */
async function listVehicles(filters = {}) {
  try {
    let query = supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true);

    // Filter by showroom if provided
    if (filters.showroomId) {
      query = query.eq("showroom_id", filters.showroomId);
    }

    // Filter by brand if provided
    if (filters.brand) {
      query = query.eq("brand", filters.brand);
    }

    // Filter by category if provided
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("List vehicles error:", error);
    throw error;
  }
}

/**
 * Get a single vehicle by ID
 */
async function getVehicle(vehicleId) {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Vehicle not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Get vehicle error:", error);
    throw error;
  }
}

/**
 * Update vehicle
 */
async function updateVehicle(vehicleId, updates) {
  try {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("vehicles")
      .update(updates)
      .eq("id", vehicleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Update vehicle error:", error);
    throw error;
  }
}

/**
 * Update vehicle stock
 */
async function updateVehicleStock(vehicleId, variantId, colorId, quantity) {
  try {
    // This would update the vehicle_colors table
    const { data, error } = await supabase
      .from("vehicle_colors")
      .update({
        stock_qty: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", colorId)
      .eq("variant_id", variantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Update vehicle stock error:", error);
    throw error;
  }
}

/**
 * Soft delete vehicle
 */
async function deleteVehicle(vehicleId) {
  try {
    const { error } = await supabase
      .from("vehicles")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);

    if (error) {
      throw error;
    }

    return { success: true, message: "Vehicle deleted successfully" };
  } catch (error) {
    console.error("Delete vehicle error:", error);
    throw error;
  }
}

module.exports = {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  updateVehicleStock,
  deleteVehicle,
};

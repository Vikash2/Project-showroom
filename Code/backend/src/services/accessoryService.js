const { supabase } = require("../config/supabase");

/**
 * Create a new accessory
 */
async function createAccessory(accessoryData) {
  try {
    const { data, error } = await supabase
      .from("accessories")
      .insert({
        ...accessoryData,
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
    console.error("Create accessory error:", error);
    throw error;
  }
}

/**
 * List all accessories with optional filters
 */
async function listAccessories(filters = {}) {
  try {
    let query = supabase
      .from("accessories")
      .select("*")
      .eq("is_active", true);

    // Filter by showroom if provided
    if (filters.showroomId) {
      query = query.eq("showroom_id", filters.showroomId);
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
    console.error("List accessories error:", error);
    throw error;
  }
}

/**
 * Get a single accessory by ID
 */
async function getAccessory(accessoryId) {
  try {
    const { data, error } = await supabase
      .from("accessories")
      .select("*")
      .eq("id", accessoryId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Accessory not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Get accessory error:", error);
    throw error;
  }
}

/**
 * Update accessory
 */
async function updateAccessory(accessoryId, updates) {
  try {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("accessories")
      .update(updates)
      .eq("id", accessoryId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Update accessory error:", error);
    throw error;
  }
}

/**
 * Soft delete accessory
 */
async function deleteAccessory(accessoryId) {
  try {
    const { error } = await supabase
      .from("accessories")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", accessoryId);

    if (error) {
      throw error;
    }

    return { success: true, message: "Accessory deleted successfully" };
  } catch (error) {
    console.error("Delete accessory error:", error);
    throw error;
  }
}

module.exports = {
  createAccessory,
  listAccessories,
  getAccessory,
  updateAccessory,
  deleteAccessory,
};

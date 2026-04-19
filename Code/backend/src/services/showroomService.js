const { supabase } = require("../config/supabase");

/**
 * Create a new showroom
 */
async function createShowroom(showroomData) {
  try {
    const { data, error } = await supabase
      .from("showrooms")
      .insert({
        ...showroomData,
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
    console.error("Create showroom error:", error);
    throw error;
  }
}

/**
 * List all showrooms with optional filters
 */
async function listShowrooms(filters = {}) {
  try {
    let query = supabase
      .from("showrooms")
      .select("*")
      .eq("is_active", true);

    // Filter by location if provided
    if (filters.location) {
      query = query.eq("location", filters.location);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("List showrooms error:", error);
    throw error;
  }
}

/**
 * Get a single showroom by ID
 */
async function getShowroom(showroomId) {
  try {
    const { data, error } = await supabase
      .from("showrooms")
      .select("*")
      .eq("id", showroomId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Showroom not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Get showroom error:", error);
    throw error;
  }
}

/**
 * Update showroom
 */
async function updateShowroom(showroomId, updates) {
  try {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("showrooms")
      .update(updates)
      .eq("id", showroomId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Update showroom error:", error);
    throw error;
  }
}

/**
 * Soft delete showroom
 */
async function deleteShowroom(showroomId) {
  try {
    const { error } = await supabase
      .from("showrooms")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", showroomId);

    if (error) {
      throw error;
    }

    return { success: true, message: "Showroom deleted successfully" };
  } catch (error) {
    console.error("Delete showroom error:", error);
    throw error;
  }
}

module.exports = {
  createShowroom,
  listShowrooms,
  getShowroom,
  updateShowroom,
  deleteShowroom,
};

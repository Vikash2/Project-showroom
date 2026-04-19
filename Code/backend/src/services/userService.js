const { supabase } = require("../config/supabase");

/**
 * Create a new user in Supabase Auth and Database
 */
async function createUser(userData) {
  try {
    const { email, password, name, mobile, role, showroomId } = userData;

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        mobile,
        role,
        showroom_id: showroomId || null,
      },
    });

    if (authError) {
      throw authError;
    }

    const uid = authData.user.id;

    // Create user profile in database
    const { data: dbData, error: dbError } = await supabase
      .from("users")
      .insert({
        id: uid,
        name,
        email,
        mobile,
        role,
        showroom_id: showroomId || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      // Rollback: delete auth user if database insert fails
      await supabase.auth.admin.deleteUser(uid);
      throw dbError;
    }

    return { id: uid, ...dbData };
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
}

/**
 * Get a single user by UID
 */
async function getUser(uid) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // User not found
      }
      throw error;
    }

    return { id: data.id, ...data };
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

/**
 * List all users (with optional filtering)
 */
async function listUsers(filters = {}) {
  try {
    let query = supabase
      .from("users")
      .select("*")
      .eq("is_active", true);

    // Filter by showroom if provided
    if (filters.showroomId) {
      query = query.eq("showroom_id", filters.showroomId);
    }

    // Filter by role if provided
    if (filters.role) {
      query = query.eq("role", filters.role);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(user => ({ id: user.id, ...user }));
  } catch (error) {
    console.error("List users error:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
async function updateUser(uid, updates) {
  try {
    const allowedUpdates = { name: true, mobile: true, email: true };
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates[key]) {
        filteredUpdates[key] = updates[key];
      }
    });

    filteredUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(filteredUpdates)
      .eq("id", uid)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update Supabase Auth if email changed
    if (updates.email) {
      await supabase.auth.admin.updateUserById(uid, { email: updates.email });
    }

    return { id: data.id, ...data };
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
}

/**
 * Update user role and showroom assignment
 */
async function updateUserRole(uid, role, showroomId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        role,
        showroom_id: showroomId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update user metadata in Supabase Auth
    await supabase.auth.admin.updateUserById(uid, {
      user_metadata: {
        role,
        showroom_id: showroomId || null,
      },
    });

    return { id: data.id, ...data };
  } catch (error) {
    console.error("Update user role error:", error);
    throw error;
  }
}

/**
 * Soft delete user (disable)
 */
async function deleteUser(uid) {
  try {
    // Soft delete in database
    const { error: dbError } = await supabase
      .from("users")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", uid);

    if (dbError) {
      throw dbError;
    }

    // Disable Supabase Auth user
    await supabase.auth.admin.updateUserById(uid, {
      ban_duration: "876000h", // Ban for 100 years (effectively permanent)
    });

    return { success: true, message: "User disabled successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  listUsers,
  updateUser,
  updateUserRole,
  deleteUser,
};

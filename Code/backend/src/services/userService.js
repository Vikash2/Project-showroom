const { db, auth } = require("../config/firebase");

const USERS_REF = "users";

/**
 * Create a new user in Firebase Auth and RTDB
 */
async function createUser(userData) {
  try {
    const { email, password, name, mobile, role, showroomId } = userData;

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // Set custom claims for role-based access
    await auth.setCustomUserClaims(uid, { 
      role, 
      showroomId: showroomId || null 
    });

    // Store user data in RTDB
    const userDoc = {
      uid,
      email,
      name,
      mobile,
      role,
      showroomId: showroomId || null,
      createdAt: Date.now(),
      isActive: true,
    };

    await db.ref(`${USERS_REF}/${uid}`).set(userDoc);

    return { id: uid, ...userDoc };
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
    const snap = await db.ref(`${USERS_REF}/${uid}`).once("value");
    
    if (!snap.exists()) {
      return null;
    }

    return { id: uid, ...snap.val() };
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
    let query = db.ref(USERS_REF);

    // Filter by showroom if provided
    if (filters.showroomId) {
      query = query.orderByChild("showroomId").equalTo(filters.showroomId);
    }

    const snap = await query.once("value");
    
    if (!snap.exists()) {
      return [];
    }

    const users = [];
    snap.forEach((childSnap) => {
      users.push({ id: childSnap.key, ...childSnap.val() });
    });

    // Filter by role if provided (RTDB doesn't support multiple orderBy)
    if (filters.role) {
      return users.filter(u => u.role === filters.role);
    }

    return users;
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

    filteredUpdates.updatedAt = Date.now();

    await db.ref(`${USERS_REF}/${uid}`).update(filteredUpdates);

    // Update Firebase Auth if email changed
    if (updates.email) {
      await auth.updateUser(uid, { email: updates.email });
    }

    return await getUser(uid);
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
}

/**
 * Update user role and custom claims
 */
async function updateUserRole(uid, role, showroomId) {
  try {
    // Update custom claims
    await auth.setCustomUserClaims(uid, { role, showroomId: showroomId || null });

    // Update RTDB
    await db.ref(`${USERS_REF}/${uid}`).update({
      role,
      showroomId: showroomId || null,
      updatedAt: Date.now(),
    });

    return await getUser(uid);
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
    // Disable Firebase Auth user
    await auth.updateUser(uid, { disabled: true });

    // Soft delete in RTDB
    await db.ref(`${USERS_REF}/${uid}`).update({
      isActive: false,
      deletedAt: Date.now(),
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

const { db } = require("../config/firebase");

const SHOWROOMS_REF = "showrooms";

/**
 * Create a new showroom
 */
async function createShowroom(showroomData) {
  try {
    const ref = db.ref(SHOWROOMS_REF).push();
    const showroomId = ref.key;

    const showroom = {
      showroomId,
      ...showroomData,
      createdAt: Date.now(),
      isActive: showroomData.isActive !== undefined ? showroomData.isActive : true,
    };

    await ref.set(showroom);
    return showroom;
  } catch (error) {
    console.error("Create showroom error:", error);
    throw error;
  }
}

/**
 * List all showrooms
 */
async function listShowrooms(filters = {}) {
  try {
    const snap = await db.ref(SHOWROOMS_REF).once("value");
    
    if (!snap.exists()) {
      return [];
    }

    const showrooms = [];
    snap.forEach((childSnap) => {
      const showroom = { showroomId: childSnap.key, ...childSnap.val() };
      
      // Apply filters
      if (filters.isActive !== undefined && showroom.isActive !== filters.isActive) {
        return;
      }
      
      showrooms.push(showroom);
    });

    return showrooms;
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
    const snap = await db.ref(`${SHOWROOMS_REF}/${showroomId}`).once("value");
    
    if (!snap.exists()) {
      return null;
    }

    return { showroomId, ...snap.val() };
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
    updates.updatedAt = Date.now();
    await db.ref(`${SHOWROOMS_REF}/${showroomId}`).update(updates);
    return await getShowroom(showroomId);
  } catch (error) {
    console.error("Update showroom error:", error);
    throw error;
  }
}

/**
 * Delete showroom (soft delete)
 */
async function deleteShowroom(showroomId) {
  try {
    await db.ref(`${SHOWROOMS_REF}/${showroomId}`).update({
      isActive: false,
      deletedAt: Date.now(),
    });
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

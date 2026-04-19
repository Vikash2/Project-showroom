const { db } = require("../config/firebase");

const ACCESSORIES_REF = "accessories";

/**
 * Create a new accessory
 */
async function createAccessory(accessoryData) {
  try {
    const ref = db.ref(ACCESSORIES_REF).push();
    const accessoryId = ref.key;

    const accessory = {
      accessoryId,
      ...accessoryData,
      createdAt: Date.now(),
      isActive: accessoryData.isActive !== undefined ? accessoryData.isActive : true,
    };

    await ref.set(accessory);
    return accessory;
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
    const snap = await db.ref(ACCESSORIES_REF).once("value");
    
    if (!snap.exists()) {
      return [];
    }

    const accessories = [];
    snap.forEach((childSnap) => {
      const accessory = { accessoryId: childSnap.key, ...childSnap.val() };
      
      // Apply filters
      if (filters.category && accessory.category !== filters.category) {
        return;
      }
      if (filters.isActive !== undefined && accessory.isActive !== filters.isActive) {
        return;
      }
      if (filters.showroomId && accessory.showroomId !== filters.showroomId) {
        return;
      }
      
      // Filter by vehicle compatibility
      if (filters.vehicleId) {
        if (!accessory.compatibleVehicles || 
            !accessory.compatibleVehicles.includes(filters.vehicleId)) {
          return;
        }
      }
      
      accessories.push(accessory);
    });

    return accessories;
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
    const snap = await db.ref(`${ACCESSORIES_REF}/${accessoryId}`).once("value");
    
    if (!snap.exists()) {
      return null;
    }

    return { accessoryId, ...snap.val() };
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
    updates.updatedAt = Date.now();
    await db.ref(`${ACCESSORIES_REF}/${accessoryId}`).update(updates);
    return await getAccessory(accessoryId);
  } catch (error) {
    console.error("Update accessory error:", error);
    throw error;
  }
}

/**
 * Delete accessory (soft delete)
 */
async function deleteAccessory(accessoryId) {
  try {
    await db.ref(`${ACCESSORIES_REF}/${accessoryId}`).update({
      isActive: false,
      deletedAt: Date.now(),
    });
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

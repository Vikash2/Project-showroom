const { db } = require("../config/firebase");

const VEHICLES_REF = "vehicles";

/**
 * Create a new vehicle
 */
async function createVehicle(vehicleData) {
  try {
    const ref = db.ref(VEHICLES_REF).push();
    const vehicleId = ref.key;

    const vehicle = {
      vehicleId,
      ...vehicleData,
      createdAt: Date.now(),
      isActive: vehicleData.isActive !== undefined ? vehicleData.isActive : true,
    };

    await ref.set(vehicle);
    return vehicle;
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
    const snap = await db.ref(VEHICLES_REF).once("value");
    
    if (!snap.exists()) {
      return [];
    }

    const vehicles = [];
    snap.forEach((childSnap) => {
      const vehicle = { vehicleId: childSnap.key, ...childSnap.val() };
      
      // Apply filters
      if (filters.category && vehicle.category !== filters.category) {
        return;
      }
      if (filters.brand && vehicle.brand !== filters.brand) {
        return;
      }
      if (filters.isActive !== undefined && vehicle.isActive !== filters.isActive) {
        return;
      }
      if (filters.showroomId && vehicle.showroomId !== filters.showroomId) {
        return;
      }
      
      vehicles.push(vehicle);
    });

    return vehicles;
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
    const snap = await db.ref(`${VEHICLES_REF}/${vehicleId}`).once("value");
    
    if (!snap.exists()) {
      return null;
    }

    return { vehicleId, ...snap.val() };
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
    updates.updatedAt = Date.now();
    await db.ref(`${VEHICLES_REF}/${vehicleId}`).update(updates);
    return await getVehicle(vehicleId);
  } catch (error) {
    console.error("Update vehicle error:", error);
    throw error;
  }
}

/**
 * Update stock for a specific variant and color
 */
async function updateStock(vehicleId, variantId, colorName, stockData) {
  try {
    const path = `${VEHICLES_REF}/${vehicleId}/variants/${variantId}/colors/${colorName}`;
    
    const updates = {
      stockQty: stockData.stockQty,
      updatedAt: Date.now(),
    };

    if (stockData.status) {
      updates.status = stockData.status;
    } else {
      // Auto-determine status based on quantity
      if (stockData.stockQty === 0) {
        updates.status = "Out of Stock";
      } else if (stockData.stockQty <= 3) {
        updates.status = "Low Stock";
      } else {
        updates.status = "In Stock";
      }
    }

    await db.ref(path).update(updates);
    return await getVehicle(vehicleId);
  } catch (error) {
    console.error("Update stock error:", error);
    throw error;
  }
}

/**
 * Delete vehicle (soft delete)
 */
async function deleteVehicle(vehicleId) {
  try {
    await db.ref(`${VEHICLES_REF}/${vehicleId}`).update({
      isActive: false,
      deletedAt: Date.now(),
    });
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
  updateStock,
  deleteVehicle,
};

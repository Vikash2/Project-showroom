require("dotenv").config();
const { db } = require("../src/config/firebase");

/**
 * Script to initialize Super Admin data in RTDB after manual Auth creation
 * usage: node scripts/initAdminDb.js <UID>
 */
async function initAdminDb() {
  const uid = process.argv[2];
  
  if (!uid) {
    console.error("❌ Error: Please provide the User UID as an argument.");
    console.log("Usage: node scripts/initAdminDb.js <UID>");
    process.exit(1);
  }

  const email = process.env.SUPER_ADMIN_EMAIL || "admin@sandhyahonda.com";
  const name = "Super Admin";
  const mobile = "9999999999";

  console.log(`🔄 Initializing DB data for UID: ${uid}...`);

  try {
    await db.ref(`users/${uid}`).set({
      uid: uid,
      email,
      name,
      mobile,
      role: "Super Admin",
      showroomId: null,
      createdAt: Date.now(),
      isActive: true,
    });

    console.log("✅ User metadata saved to Realtime Database!");
    console.log("🎉 You can now login with this user.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error saving to RTDB:", error.message);
    process.exit(1);
  }
}

initAdminDb();

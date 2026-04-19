const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return {
        adminSDK: admin,
        db: admin.database(),
        auth: admin.auth(),
        storage: admin.storage(),
      };
    }

    // For local emulator
    if (process.env.FIREBASE_EMULATOR === "true") {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DB_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      
      // Connect to emulators
      process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
      process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199";
    } else {
      // Production - requires serviceAccountKey.json
      const serviceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DB_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    console.log("✅ Firebase Admin SDK initialized successfully");

    return {
      adminSDK: admin,
      db: admin.database(),
      auth: admin.auth(),
      storage: admin.storage(),
    };
  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
    throw error;
  }
};

const { adminSDK, db, auth, storage } = initializeFirebase();

module.exports = { admin: adminSDK, db, auth, storage };

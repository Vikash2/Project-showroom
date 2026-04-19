require("dotenv").config();
const { supabase } = require("../src/config/supabase");

/**
 * Script to delete a user by email
 * Usage: node scripts/deleteUser.js
 */

async function deleteUser() {
  try {
    const email = process.env.DELETE_USER_EMAIL || "admin@vehiclezo.com";
    
    console.log(`🗑️  Deleting user: ${email}\n`);

    // First, get the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError.message);
      process.exit(1);
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log("ℹ️  User not found in auth system");
      process.exit(0);
    }

    console.log(`Found user: ${user.id}`);

    // Delete from auth (this will cascade to users table)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("❌ Error deleting user:", deleteError.message);
      process.exit(1);
    }

    console.log("✅ User deleted successfully\n");
    console.log("You can now run createSuperAdmin.js again");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
deleteUser();

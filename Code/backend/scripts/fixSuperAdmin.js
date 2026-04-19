require("dotenv").config();
const { supabase } = require("../src/config/supabase");

/**
 * Script to fix Super Admin user profile
 * Use this if the auth user exists but profile is missing
 * Usage: node scripts/fixSuperAdmin.js
 */

async function fixSuperAdmin() {
  try {
    console.log("🔧 Fixing Super Admin user profile...\n");

    const email = "admin@vehiclezo.com";
    const name = "Super Admin";
    const mobile = "9999999999";

    // Get the auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError.message);
      process.exit(1);
    }

    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      console.log("❌ Auth user not found. Run createSuperAdmin.js instead.");
      process.exit(1);
    }

    console.log(`✅ Found auth user: ${authUser.id}`);

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (existingProfile) {
      console.log("✅ User profile already exists!");
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Email:    ", existingProfile.email);
      console.log("👤 Name:     ", existingProfile.name);
      console.log("📱 Mobile:   ", existingProfile.mobile);
      console.log("🎭 Role:     ", existingProfile.role);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      console.log("You can now login with:");
      console.log("Email: admin@vehiclezo.com");
      console.log("Password: Admin@123456");
      process.exit(0);
    }

    // Create the profile
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert({
        id: authUser.id,
        email,
        name,
        mobile,
        role: "Super Admin",
        showroom_id: null,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database Error:", dbError.message);
      console.error("\nDetails:", dbError);
      process.exit(1);
    }

    console.log("✅ User profile created\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Super Admin Fixed Successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: Admin@123456`);
    console.log(`👤 Name:     ${name}`);
    console.log(`📱 Mobile:   ${mobile}`);
    console.log(`🎭 Role:     Super Admin`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
fixSuperAdmin();

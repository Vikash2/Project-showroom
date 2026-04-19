require("dotenv").config();
const { supabase } = require("../src/config/supabase");

async function createCashier() {
  try {
    console.log("🔐 Creating Cashier user...\n");

    // Get showroom ID (use first available showroom)
    const { data: showrooms, error: showroomErr } = await supabase
      .from("showrooms")
      .select("id, name")
      .eq("is_active", true)
      .limit(1);

    if (showroomErr) throw showroomErr;

    if (!showrooms || showrooms.length === 0) {
      console.error("❌ No showrooms found. Please create a showroom first.");
      console.log("\n💡 You can create a showroom by running:");
      console.log("   node scripts/createShowroom.js");
      console.log("\nOr via SQL in Supabase Dashboard:");
      console.log(`
INSERT INTO showrooms (name, location, address, contact_number, email, is_active)
VALUES (
  'Main Showroom',
  'City Center',
  '123 Main Street, City, State',
  '9999999999',
  'showroom@vehiclezo.com',
  true
);
      `);
      process.exit(1);
    }

    const showroomId = showrooms[0].id;
    console.log(`📍 Using showroom: ${showrooms[0].name} (${showroomId})\n`);

    // Check if cashier already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", "cashier@vehiclezo.com")
      .single();

    if (existingUser) {
      console.log("⚠️  Cashier user already exists!");
      console.log(`📧 Email: cashier@vehiclezo.com`);
      console.log(`🆔 User ID: ${existingUser.id}`);
      console.log("\n💡 You can login with:");
      console.log("   Email: cashier@vehiclezo.com");
      console.log("   Password: Cashier@123456 (if not changed)");
      process.exit(0);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "cashier@vehiclezo.com",
      password: "Cashier@123456",
      email_confirm: true,
      user_metadata: {
        name: "Test Cashier",
        mobile: "9876543210",
        role: "Cashier",
        showroom_id: showroomId,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("⚠️  Email already registered in auth system.");
        console.log("💡 Try deleting the user from Supabase Dashboard > Authentication > Users");
        process.exit(1);
      }
      throw authError;
    }

    const uid = authData.user.id;
    console.log(`✅ Auth user created: ${uid}`);

    // Create user profile
    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: uid,
        email: "cashier@vehiclezo.com",
        name: "Test Cashier",
        mobile: "9876543210",
        role: "Cashier",
        showroom_id: showroomId,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    console.log("✅ User profile created\n");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Cashier User Created Successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    cashier@vehiclezo.com");
    console.log("🔑 Password: Cashier@123456");
    console.log("👤 Name:     Test Cashier");
    console.log("📱 Mobile:   9876543210");
    console.log("🎭 Role:     Cashier");
    console.log(`🏢 Showroom: ${showrooms[0].name}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("⚠️  Please change the password after first login!\n");
    console.log("🚀 Next steps:");
    console.log("   1. Login at http://localhost:5173");
    console.log("   2. Use the credentials above");
    console.log("   3. Start building the cashier dashboard\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating cashier:", error.message);
    if (error.details) {
      console.error("Details:", error.details);
    }
    if (error.hint) {
      console.error("Hint:", error.hint);
    }
    process.exit(1);
  }
}

createCashier();

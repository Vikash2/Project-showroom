require("dotenv").config();
const { supabase } = require("../src/config/supabase");

async function createShowroom() {
  try {
    console.log("🏢 Creating showroom...\n");

    // Check if showroom already exists
    const { data: existingShowrooms, error: checkErr } = await supabase
      .from("showrooms")
      .select("id, name")
      .eq("is_active", true);

    if (checkErr) throw checkErr;

    if (existingShowrooms && existingShowrooms.length > 0) {
      console.log("✅ Showrooms already exist:");
      existingShowrooms.forEach((showroom, index) => {
        console.log(`   ${index + 1}. ${showroom.name} (${showroom.id})`);
      });
      console.log("\n💡 You can now create a cashier user:");
      console.log("   node scripts/createCashier.js\n");
      process.exit(0);
    }

    // Create new showroom
    const { data: showroom, error: createErr } = await supabase
      .from("showrooms")
      .insert({
        name: "Main Showroom",
        location: "City Center",
        address: "123 Main Street, City, State, PIN 123456",
        contact_number: "9999999999",
        email: "showroom@vehiclezo.com",
        manager_name: "Showroom Manager",
        is_active: true,
      })
      .select()
      .single();

    if (createErr) throw createErr;

    console.log("✅ Showroom created successfully!\n");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏢 Showroom Details");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🆔 ID:       ${showroom.id}`);
    console.log(`📛 Name:     ${showroom.name}`);
    console.log(`📍 Location: ${showroom.location}`);
    console.log(`📧 Email:    ${showroom.email}`);
    console.log(`📱 Phone:    ${showroom.contact_number}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎯 Next steps:");
    console.log("   1. Create cashier user:");
    console.log("      node scripts/createCashier.js");
    console.log("\n   2. Or create more users via admin dashboard\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating showroom:", error.message);
    if (error.details) {
      console.error("Details:", error.details);
    }
    if (error.hint) {
      console.error("Hint:", error.hint);
    }
    process.exit(1);
  }
}

createShowroom();

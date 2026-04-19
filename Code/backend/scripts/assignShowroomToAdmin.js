require("dotenv").config();
const { supabase } = require("../src/config/supabase");

async function assignShowroomToAdmin() {
  try {
    console.log("🔧 Assigning showroom to admin users...\n");

    // Get the default showroom
    const { data: showrooms, error: showroomErr } = await supabase
      .from("showrooms")
      .select("id, name")
      .eq("is_active", true)
      .limit(1);

    if (showroomErr) throw showroomErr;

    if (!showrooms || showrooms.length === 0) {
      console.log("❌ No active showrooms found!");
      console.log("💡 Please create a showroom first:");
      console.log("   node scripts/createShowroom.js\n");
      process.exit(1);
    }

    const defaultShowroom = showrooms[0];
    console.log(`✅ Found showroom: ${defaultShowroom.name} (${defaultShowroom.id})\n`);

    // Get all users without a showroom_id
    const { data: users, error: usersErr } = await supabase
      .from("users")
      .select("id, email, name, role, showroom_id")
      .is("showroom_id", null);

    if (usersErr) throw usersErr;

    if (!users || users.length === 0) {
      console.log("✅ All users already have showrooms assigned!\n");
      process.exit(0);
    }

    console.log(`📋 Found ${users.length} user(s) without showroom:\n`);

    // Update each user
    for (const user of users) {
      console.log(`   Updating: ${user.name} (${user.email}) - ${user.role}`);
      
      const { error: updateErr } = await supabase
        .from("users")
        .update({ showroom_id: defaultShowroom.id })
        .eq("id", user.id);

      if (updateErr) {
        console.log(`   ❌ Failed to update ${user.email}:`, updateErr.message);
      } else {
        // Also update auth metadata
        try {
          await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
              showroom_id: defaultShowroom.id,
            },
          });
          console.log(`   ✅ Updated successfully`);
        } catch (authErr) {
          console.log(`   ⚠️  Updated DB but failed to update auth metadata`);
        }
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Showroom assignment complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🏢 All users assigned to: ${defaultShowroom.name}`);
    console.log(`🆔 Showroom ID: ${defaultShowroom.id}\n`);

    console.log("🎯 Next steps:");
    console.log("   1. Users can now create bookings");
    console.log("   2. Bookings will automatically use their showroom ID\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning showroom:", error.message);
    if (error.details) {
      console.error("Details:", error.details);
    }
    if (error.hint) {
      console.error("Hint:", error.hint);
    }
    process.exit(1);
  }
}

assignShowroomToAdmin();

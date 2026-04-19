require("dotenv").config();
const { supabase } = require("../src/config/supabase");

async function testLogin() {
  console.log("🔍 Testing login system...\n");

  // Check if we can connect to Supabase
  console.log("1. Checking Supabase connection...");
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, email, name, role")
    .limit(5);

  if (usersError) {
    console.error("❌ Error fetching users:", usersError.message);
    process.exit(1);
  }

  console.log(`✅ Found ${users.length} users in database\n`);

  if (users.length === 0) {
    console.log("⚠️  No users found. You need to create a user first.");
    console.log("   Run: node scripts/createSuperAdmin.js\n");
    process.exit(0);
  }

  console.log("Users in database:");
  users.forEach((user, i) => {
    console.log(`  ${i + 1}. ${user.email} (${user.role})`);
  });

  console.log("\n2. Checking Supabase Auth users...");
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("❌ Error fetching auth users:", authError.message);
  } else {
    console.log(`✅ Found ${authData.users.length} auth users\n`);
    
    if (authData.users.length === 0) {
      console.log("⚠️  No auth users found. Users need to be created in Supabase Auth.");
    } else {
      console.log("Auth users:");
      authData.users.forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
      });
    }
  }

  console.log("\n✅ Test complete!");
  process.exit(0);
}

testLogin().catch((error) => {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
});

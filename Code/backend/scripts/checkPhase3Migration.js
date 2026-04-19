require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkMigration() {
  // Check if the new columns exist
  const { error: colErr } = await supabase
    .from("leads")
    .select("address")
    .limit(0);

  if (colErr && colErr.message.includes("address")) {
    console.log("❌ Migration NOT yet applied (address column missing)");
    return false;
  }

  // Check if inquiry_tasks table exists
  const { error: taskErr } = await supabase
    .from("inquiry_tasks")
    .select("id")
    .limit(0);

  if (taskErr) {
    console.log("❌ Migration NOT yet applied (inquiry_tasks table missing)");
    return false;
  }

  // Check if inquiry_history table exists
  const { error: histErr } = await supabase
    .from("inquiry_history")
    .select("id")
    .limit(0);

  if (histErr) {
    console.log("❌ Migration NOT yet applied (inquiry_history table missing)");
    return false;
  }

  console.log("✅ Migration appears to be applied!");
  return true;
}

checkMigration().then((ok) => {
  if (!ok) {
    console.log("\n📋 Run the SQL in: migrations/phase3_inquiry_management.sql");
    console.log("🔗 Supabase Dashboard > SQL Editor > New Query");
  }
  process.exit(ok ? 0 : 1);
});

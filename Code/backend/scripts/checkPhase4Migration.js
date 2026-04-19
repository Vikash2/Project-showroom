require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkMigration() {
  // Check if booking_payments table exists
  const { error: paymentErr } = await supabase
    .from("booking_payments")
    .select("id")
    .limit(0);

  if (paymentErr) {
    return false;
  }

  // Check if delivery_date column exists in Bookings
  const { error: bookingErr } = await supabase
    .from("bookings")
    .select("delivery_date")
    .limit(0);

  if (bookingErr) {
    return false;
  }

  return true;
}

checkMigration().then((ok) => {
  if (ok) {
    console.log("✅ Phase 4 Migration has been applied.");
  } else {
    console.log("❌ Phase 4 Migration has NOT been applied yet.");
  }
  process.exit(ok ? 0 : 1);
});

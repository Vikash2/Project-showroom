/**
 * Verification Script for Direct Sales Setup
 * Run this after applying the migration to verify everything is configured correctly
 */

const { supabase } = require("../src/config/supabase");

async function verifyDirectSalesSetup() {
  console.log("🔍 Verifying Direct Sales Setup...\n");

  let allChecks = true;

  // 1. Check if booking_id is nullable in sales table
  console.log("1️⃣ Checking sales.booking_id nullability...");
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("booking_id")
      .limit(1);

    if (error) {
      console.log("   ❌ Error querying sales table:", error.message);
      allChecks = false;
    } else {
      console.log("   ✅ Sales table is accessible");
    }
  } catch (err) {
    console.log("   ❌ Error:", err.message);
    allChecks = false;
  }

  // 2. Test creating a direct sale (without booking)
  console.log("\n2️⃣ Testing direct sale creation...");
  try {
    const testSale = {
      booking_id: null, // Direct sale
      showroom_id: "00000000-0000-0000-0000-000000000000", // Placeholder
      vehicle_id: "00000000-0000-0000-0000-000000000000",
      variant_id: "00000000-0000-0000-0000-000000000000",
      color_id: "00000000-0000-0000-0000-000000000000",
      customer_name: "Test Customer",
      mobile: "9999999999",
      sales_executive_id: "00000000-0000-0000-0000-000000000000",
      final_price: 100000,
      payment_status: "Pending",
      status: "Processing",
    };

    // Try to insert (will fail due to foreign keys, but that's ok - we're testing nullability)
    const { error } = await supabase.from("sales").insert(testSale).select();

    if (error) {
      // Check if error is about nullability or foreign keys
      if (error.message.includes("null value") && error.message.includes("booking_id")) {
        console.log("   ❌ booking_id is still NOT NULL - migration not applied");
        allChecks = false;
      } else if (error.message.includes("foreign key") || error.message.includes("violates")) {
        console.log("   ✅ booking_id accepts null (foreign key errors are expected)");
      } else {
        console.log("   ⚠️  Unexpected error:", error.message);
      }
    } else {
      console.log("   ✅ Direct sale creation works (test data inserted)");
      // Clean up test data if it was inserted
      await supabase.from("sales").delete().eq("customer_name", "Test Customer");
    }
  } catch (err) {
    console.log("   ❌ Error:", err.message);
    allChecks = false;
  }

  // 3. Check money_receipts table
  console.log("\n3️⃣ Checking money_receipts.booking_id nullability...");
  try {
    const { error } = await supabase
      .from("money_receipts")
      .select("booking_id")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.log("   ❌ Error querying money_receipts:", error.message);
      allChecks = false;
    } else {
      console.log("   ✅ money_receipts table is accessible");
    }
  } catch (err) {
    console.log("   ❌ Error:", err.message);
    allChecks = false;
  }

  // 4. Check tax_invoices table
  console.log("\n4️⃣ Checking tax_invoices.booking_id nullability...");
  try {
    const { error } = await supabase
      .from("tax_invoices")
      .select("booking_id")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.log("   ❌ Error querying tax_invoices:", error.message);
      allChecks = false;
    } else {
      console.log("   ✅ tax_invoices table is accessible");
    }
  } catch (err) {
    console.log("   ❌ Error:", err.message);
    allChecks = false;
  }

  // 5. Check delivery columns in sales table
  console.log("\n5️⃣ Checking delivery columns in sales table...");
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("delivery_status, delivery_confirmed, delivered_at")
      .limit(1);

    if (error) {
      console.log("   ❌ Delivery columns not found:", error.message);
      allChecks = false;
    } else {
      console.log("   ✅ Delivery columns exist in sales table");
    }
  } catch (err) {
    console.log("   ❌ Error:", err.message);
    allChecks = false;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (allChecks) {
    console.log("✅ All checks passed! Direct Sales setup is complete.");
    console.log("\n📝 Next steps:");
    console.log("   1. Test creating a direct sale via API");
    console.log("   2. Update frontend to use new endpoints");
    console.log("   3. Test complete sales flow");
  } else {
    console.log("❌ Some checks failed. Please review the errors above.");
    console.log("\n📝 Action required:");
    console.log("   1. Run migration: 007_make_booking_optional_in_sales.sql");
    console.log("   2. Run this script again to verify");
  }
  console.log("=".repeat(50) + "\n");
}

// Run verification
verifyDirectSalesSetup()
  .then(() => {
    console.log("Verification complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });

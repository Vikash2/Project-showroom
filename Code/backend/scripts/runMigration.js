require("dotenv").config();
const fs = require("fs");
const path = require("path");

/**
 * Apply SQL migration to Supabase using the pg-meta query endpoint
 * This uses the same API that the Supabase Dashboard SQL Editor uses
 * Usage: node scripts/runMigration.js <path-to-sql-file>
 */
async function runMigration() {
  const sqlFile =
    process.argv[2] ||
    path.join(__dirname, "../migrations/phase3_inquiry_management.sql");

  if (!fs.existsSync(sqlFile)) {
    console.error("❌ SQL file not found:", sqlFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, "utf8");
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Extract project ref from URL
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];

  console.log(`🔄 Running migration: ${path.basename(sqlFile)}`);
  console.log(`📦 Project: ${projectRef}\n`);

  try {
    // Use the Supabase pg-meta SQL query endpoint
    const response = await fetch(
      `${supabaseUrl}/pg/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "X-Connection-Encrypted": "true",
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      
      // Try alternative endpoint
      console.log("  ⚠️  pg/query endpoint not available, trying alternative...");
      
      const altResponse = await fetch(
        `https://${projectRef}.supabase.co/rest/v1/rpc/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({}),
        }
      );

      throw new Error(
        `API returned ${response.status}. Please run the SQL manually in Supabase Dashboard.`
      );
    }

    const result = await response.json();
    console.log("✅ Migration applied successfully!\n");

    if (Array.isArray(result)) {
      console.log(`  ${result.length} statement(s) executed`);
    }
  } catch (error) {
    console.error("❌ Could not apply migration via API:", error.message);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Please run the SQL manually:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`\n1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log(`2. Paste the contents of: ${sqlFile}`);
    console.log("3. Click 'Run'\n");
    process.exit(1);
  }
}

runMigration();

require("dotenv").config();

/**
 * Apply Phase 3 database migration to Supabase
 * Uses the Supabase SQL API (pg-meta) to execute DDL statements
 * Usage: node scripts/applyPhase3Migration.js
 */
async function applyMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  console.log("🔄 Applying Phase 3 migration to Supabase...\n");

  const sqlStatements = [
    {
      name: "Drop old status constraint",
      sql: `ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check`,
    },
    {
      name: "Add expanded status constraint",
      sql: `ALTER TABLE public.leads ADD CONSTRAINT leads_status_check CHECK (status IN ('New', 'Contacted', 'Follow-up', 'Test Ride Scheduled', 'Hot Lead', 'Quotation Sent', 'Booking Done', 'Lost', 'Closed'))`,
    },
    {
      name: "Add address column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address TEXT`,
    },
    {
      name: "Add vehicle_model column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS vehicle_model TEXT`,
    },
    {
      name: "Add variant_preference column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS variant_preference TEXT`,
    },
    {
      name: "Add color_preference column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS color_preference TEXT`,
    },
    {
      name: "Add budget_range column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_range TEXT`,
    },
    {
      name: "Add exchange_vehicle column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS exchange_vehicle TEXT`,
    },
    {
      name: "Add finance_required column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS finance_required BOOLEAN DEFAULT false`,
    },
    {
      name: "Add booking_id column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL`,
    },
    {
      name: "Add is_active column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
    },
    {
      name: "Add deleted_at column",
      sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`,
    },
    {
      name: "Create inquiry_tasks table",
      sql: `CREATE TABLE IF NOT EXISTS public.inquiry_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        inquiry_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMPTZ,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Overdue', 'Cancelled')),
        assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
        created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: "Create inquiry_history table",
      sql: `CREATE TABLE IF NOT EXISTS public.inquiry_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        inquiry_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('Call', 'SMS', 'WhatsApp', 'Email', 'Visit', 'Test Ride', 'Note', 'Status Change')),
        summary TEXT NOT NULL,
        details TEXT,
        outcome TEXT,
        created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    },
    {
      name: "Create indexes",
      sql: `CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_inquiry_id ON public.inquiry_tasks(inquiry_id);
      CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_status ON public.inquiry_tasks(status);
      CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_assigned_to ON public.inquiry_tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_inquiry_history_inquiry_id ON public.inquiry_history(inquiry_id);
      CREATE INDEX IF NOT EXISTS idx_inquiry_history_type ON public.inquiry_history(type);
      CREATE INDEX IF NOT EXISTS idx_leads_is_active ON public.leads(is_active)`,
    },
    {
      name: "Add updated_at trigger for inquiry_tasks",
      sql: `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inquiry_tasks_updated_at') THEN
          CREATE TRIGGER update_inquiry_tasks_updated_at BEFORE UPDATE ON public.inquiry_tasks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$`,
    },
    {
      name: "Enable RLS on inquiry_tasks",
      sql: `ALTER TABLE public.inquiry_tasks ENABLE ROW LEVEL SECURITY`,
    },
    {
      name: "Enable RLS on inquiry_history",
      sql: `ALTER TABLE public.inquiry_history ENABLE ROW LEVEL SECURITY`,
    },
  ];

  // Extract project ref from URL (e.g., https://xajqitaeliojlhrufauh.supabase.co -> xajqitaeliojlhrufauh)
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  const sqlApiUrl = `${supabaseUrl}/pg`;

  let successCount = 0;
  let failCount = 0;

  for (const stmt of sqlStatements) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ query: stmt.sql }),
      });

      if (response.ok) {
        console.log(`  ✅ ${stmt.name}`);
        successCount++;
      } else {
        const text = await response.text();
        // 404 means the RPC function doesn't exist - expected
        if (response.status === 404) {
          throw new Error("RPC not available");
        }
        console.log(`  ⚠️  ${stmt.name}: ${text}`);
        failCount++;
      }
    } catch (err) {
      // Fallback message
      failCount++;
    }
  }

  if (failCount > 0) {
    console.log("\n" + "━".repeat(60));
    console.log("⚠️  Some statements could not be executed via API.");
    console.log("📋 Please run the SQL manually in Supabase Dashboard:");
    console.log("━".repeat(60));
    console.log(`\n🔗 ${supabaseUrl.replace('.co', '.co/project/' + projectRef + '/sql/new')}`);
    console.log("\nOr go to: Supabase Dashboard → SQL Editor → New Query");
    console.log("Then paste the contents of: migrations/phase3_inquiry_management.sql\n");
  } else {
    console.log(`\n🎉 All ${successCount} migration steps applied successfully!`);
  }

  process.exit(0);
}

applyMigration();

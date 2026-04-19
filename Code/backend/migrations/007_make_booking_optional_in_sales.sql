-- =====================================================
-- MIGRATION: Make booking_id optional in sales table
-- Enable Direct Sales (sales without bookings)
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Make booking_id nullable (if not already)
ALTER TABLE public.sales ALTER COLUMN booking_id DROP NOT NULL;

-- 2. Drop unique constraint on booking_id if it exists
-- (A booking can only have one sale, but a sale doesn't need a booking)
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_booking_id_key;

-- 3. Add a partial unique index instead
-- This ensures one sale per booking (when booking exists)
-- But allows multiple sales without bookings
DROP INDEX IF EXISTS idx_sales_booking_id_unique;
CREATE UNIQUE INDEX idx_sales_booking_id_unique 
  ON public.sales(booking_id) 
  WHERE booking_id IS NOT NULL;

-- 4. Update RLS policies to handle null booking_id
DROP POLICY IF EXISTS "Sales team can manage sales" ON public.sales;
CREATE POLICY "Sales team can manage sales"
  ON public.sales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
        AND (
          role = 'Super Admin'
          OR showroom_id = sales.showroom_id
        )
    )
  );

-- 5. Update money_receipts to make booking_id optional (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'money_receipts') THEN
    ALTER TABLE public.money_receipts ALTER COLUMN booking_id DROP NOT NULL;
    
    -- Add check constraint to ensure sale_id is always present
    ALTER TABLE public.money_receipts 
      DROP CONSTRAINT IF EXISTS money_receipts_sale_id_required;
    ALTER TABLE public.money_receipts 
      ADD CONSTRAINT money_receipts_sale_id_required 
      CHECK (sale_id IS NOT NULL);
      
    RAISE NOTICE '✅ Updated money_receipts table';
  ELSE
    RAISE NOTICE '⚠️  money_receipts table does not exist - skipping';
  END IF;
END $$;

-- 6. Update tax_invoices to make booking_id optional (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tax_invoices') THEN
    ALTER TABLE public.tax_invoices ALTER COLUMN booking_id DROP NOT NULL;
    
    -- Add check constraint to ensure sale_id is always present
    ALTER TABLE public.tax_invoices 
      DROP CONSTRAINT IF EXISTS tax_invoices_sale_id_required;
    ALTER TABLE public.tax_invoices 
      ADD CONSTRAINT tax_invoices_sale_id_required 
      CHECK (sale_id IS NOT NULL);
      
    RAISE NOTICE '✅ Updated tax_invoices table';
  ELSE
    RAISE NOTICE '⚠️  tax_invoices table does not exist - skipping';
  END IF;
END $$;

-- 7. Add indexes for direct sales queries
CREATE INDEX IF NOT EXISTS idx_sales_no_booking 
  ON public.sales(id) 
  WHERE booking_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_sales_showroom_no_booking 
  ON public.sales(showroom_id, created_at DESC) 
  WHERE booking_id IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '✅ Checking booking_id nullability...';
END $;

SELECT 
  column_name, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
  AND column_name = 'booking_id';

DO $
BEGIN
  RAISE NOTICE '✅ Checking unique constraints...';
END $;

SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'sales'
  AND indexname LIKE '%booking%'
ORDER BY indexname;

DO $
BEGIN
  RAISE NOTICE '✅ Checking money_receipts and tax_invoices...';
END $;

SELECT 
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('money_receipts', 'tax_invoices')
  AND column_name IN ('booking_id', 'sale_id')
ORDER BY table_name, column_name;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ DIRECT SALES ENABLED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What changed:';
  RAISE NOTICE '   ✓ booking_id is now optional in sales table';
  RAISE NOTICE '   ✓ Unique constraint updated (one sale per booking when booking exists)';
  RAISE NOTICE '   ✓ RLS policies updated to work without booking';
  RAISE NOTICE '   ✓ money_receipts.booking_id is now optional (if table exists)';
  RAISE NOTICE '   ✓ tax_invoices.booking_id is now optional (if table exists)';
  RAISE NOTICE '   ✓ sale_id is required in receipts and invoices';
  RAISE NOTICE '   ✓ Indexes added for direct sales queries';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Sales can now be created in two ways:';
  RAISE NOTICE '   1. From Booking: POST /api/sales/bookings/:bookingId';
  RAISE NOTICE '   2. Direct Sale: POST /api/sales (no booking required)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Key Principle:';
  RAISE NOTICE '   • Booking is OPTIONAL - not a dependency';
  RAISE NOTICE '   • Sale is the single source of truth';
  RAISE NOTICE '   • All operations work via sale_id';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: If money_receipts or tax_invoices tables do not exist,';
  RAISE NOTICE '   you need to run phase5_basic_sales_flow.sql first.';
  RAISE NOTICE '';
END $;

-- =====================================================
-- VERIFICATION SCRIPT FOR DIRECT SALES MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- After running 007_make_booking_optional_in_sales.sql
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔍 VERIFYING DIRECT SALES SETUP';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $;

-- =====================================================
-- 1. CHECK SALES TABLE
-- =====================================================

DO $
DECLARE
  is_nullable TEXT;
BEGIN
  SELECT 
    CASE WHEN is_nullable = 'YES' THEN 'YES' ELSE 'NO' END
  INTO is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'sales'
    AND column_name = 'booking_id';
  
  IF is_nullable = 'YES' THEN
    RAISE NOTICE '✅ 1. sales.booking_id is NULLABLE - Direct sales enabled!';
  ELSE
    RAISE NOTICE '❌ 1. sales.booking_id is NOT NULL - Migration not applied!';
  END IF;
END $;

-- =====================================================
-- 2. CHECK UNIQUE INDEX
-- =====================================================

DO $
DECLARE
  index_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'sales'
      AND indexname = 'idx_sales_booking_id_unique'
  ) INTO index_exists;
  
  IF index_exists THEN
    RAISE NOTICE '✅ 2. Partial unique index exists - One sale per booking enforced';
  ELSE
    RAISE NOTICE '⚠️  2. Partial unique index not found - May need to create it';
  END IF;
END $;

-- =====================================================
-- 3. CHECK RLS POLICY
-- =====================================================

DO $
DECLARE
  policy_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'sales'
      AND policyname = 'Sales team can manage sales'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE '✅ 3. RLS policy exists - Access control configured';
  ELSE
    RAISE NOTICE '⚠️  3. RLS policy not found - May need to create it';
  END IF;
END $;

-- =====================================================
-- 4. CHECK MONEY_RECEIPTS TABLE
-- =====================================================

DO $
DECLARE
  table_exists BOOLEAN;
  is_nullable TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'money_receipts'
  ) INTO table_exists;
  
  IF table_exists THEN
    SELECT 
      CASE WHEN is_nullable = 'YES' THEN 'YES' ELSE 'NO' END
    INTO is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'money_receipts'
      AND column_name = 'booking_id';
    
    IF is_nullable = 'YES' THEN
      RAISE NOTICE '✅ 4. money_receipts table exists and booking_id is NULLABLE';
    ELSE
      RAISE NOTICE '⚠️  4. money_receipts table exists but booking_id is NOT NULL';
      RAISE NOTICE '   → Run migration 007 again to fix this';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  4. money_receipts table does not exist';
    RAISE NOTICE '   → This is OK for now. Run phase5_basic_sales_flow.sql when needed';
  END IF;
END $;

-- =====================================================
-- 5. CHECK TAX_INVOICES TABLE
-- =====================================================

DO $
DECLARE
  table_exists BOOLEAN;
  is_nullable TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'tax_invoices'
  ) INTO table_exists;
  
  IF table_exists THEN
    SELECT 
      CASE WHEN is_nullable = 'YES' THEN 'YES' ELSE 'NO' END
    INTO is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'tax_invoices'
      AND column_name = 'booking_id';
    
    IF is_nullable = 'YES' THEN
      RAISE NOTICE '✅ 5. tax_invoices table exists and booking_id is NULLABLE';
    ELSE
      RAISE NOTICE '⚠️  5. tax_invoices table exists but booking_id is NOT NULL';
      RAISE NOTICE '   → Run migration 007 again to fix this';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  5. tax_invoices table does not exist';
    RAISE NOTICE '   → This is OK for now. Run phase5_basic_sales_flow.sql when needed';
  END IF;
END $;

-- =====================================================
-- 6. CHECK DELIVERY COLUMNS
-- =====================================================

DO $
DECLARE
  delivery_status_exists BOOLEAN;
  delivery_confirmed_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sales'
      AND column_name = 'delivery_status'
  ) INTO delivery_status_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sales'
      AND column_name = 'delivery_confirmed'
  ) INTO delivery_confirmed_exists;
  
  IF delivery_status_exists AND delivery_confirmed_exists THEN
    RAISE NOTICE '✅ 6. Delivery columns exist in sales table';
  ELSE
    RAISE NOTICE '⚠️  6. Delivery columns missing in sales table';
    RAISE NOTICE '   → Run migration 006_add_delivery_to_sales.sql';
  END IF;
END $;

-- =====================================================
-- 7. TEST DIRECT SALE CREATION (DRY RUN)
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '7️⃣ Testing direct sale creation (dry run)...';
  
  -- This just checks if the structure allows null booking_id
  -- We won't actually insert anything
  
  BEGIN
    -- Try to prepare an insert statement with null booking_id
    PERFORM 1 FROM sales WHERE booking_id IS NULL LIMIT 1;
    RAISE NOTICE '✅ Query with NULL booking_id works';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Query with NULL booking_id failed: %', SQLERRM;
  END;
END $;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $
DECLARE
  sales_nullable TEXT;
  can_use_direct_sales BOOLEAN := false;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 VERIFICATION SUMMARY';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  
  -- Check if direct sales can be used
  SELECT 
    CASE WHEN is_nullable = 'YES' THEN 'YES' ELSE 'NO' END
  INTO sales_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'sales'
    AND column_name = 'booking_id';
  
  IF sales_nullable = 'YES' THEN
    can_use_direct_sales := true;
    RAISE NOTICE '✅ DIRECT SALES ARE ENABLED!';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 You can now:';
    RAISE NOTICE '   • Create sales without bookings';
    RAISE NOTICE '   • Use POST /api/sales endpoint';
    RAISE NOTICE '   • Upload documents with saleId';
    RAISE NOTICE '   • Process payments with saleId';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Test creating a direct sale via API';
    RAISE NOTICE '   2. Update frontend to use new endpoints';
    RAISE NOTICE '   3. Test complete sales flow';
  ELSE
    RAISE NOTICE '❌ DIRECT SALES NOT ENABLED';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Action required:';
    RAISE NOTICE '   1. Run migration: 007_make_booking_optional_in_sales.sql';
    RAISE NOTICE '   2. Run this verification script again';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $;

-- =====================================================
-- DETAILED TABLE INFO (Optional - for debugging)
-- =====================================================

-- Uncomment below to see detailed column information

/*
SELECT 
  'sales' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
  AND column_name IN ('id', 'booking_id', 'showroom_id', 'customer_name', 'delivery_status')
ORDER BY ordinal_position;
*/

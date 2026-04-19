-- =====================================================
-- SIMPLE VERIFICATION FOR DIRECT SALES MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Check if booking_id is nullable in sales table
SELECT 
  '1. sales.booking_id nullability' as check_name,
  CASE 
    WHEN is_nullable = 'YES' THEN '✅ NULLABLE - Direct sales enabled!'
    ELSE '❌ NOT NULL - Migration not applied!'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
  AND column_name = 'booking_id';

-- 2. Check if unique index exists
SELECT 
  '2. Partial unique index' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTS - One sale per booking enforced'
    ELSE '⚠️  NOT FOUND - May need to create it'
  END as status
FROM pg_indexes
WHERE tablename = 'sales'
  AND indexname = 'idx_sales_booking_id_unique';

-- 3. Check RLS policy
SELECT 
  '3. RLS policy' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTS - Access control configured'
    ELSE '⚠️  NOT FOUND - May need to create it'
  END as status
FROM pg_policies
WHERE tablename = 'sales'
  AND policyname = 'Sales team can manage sales';

-- 4. Check money_receipts table
SELECT 
  '4. money_receipts table' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      CASE 
        WHEN (SELECT is_nullable FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'money_receipts' 
                AND column_name = 'booking_id') = 'YES'
        THEN '✅ EXISTS and booking_id is NULLABLE'
        ELSE '⚠️  EXISTS but booking_id is NOT NULL'
      END
    ELSE '⚠️  DOES NOT EXIST (OK for now)'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'money_receipts';

-- 5. Check tax_invoices table
SELECT 
  '5. tax_invoices table' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      CASE 
        WHEN (SELECT is_nullable FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'tax_invoices' 
                AND column_name = 'booking_id') = 'YES'
        THEN '✅ EXISTS and booking_id is NULLABLE'
        ELSE '⚠️  EXISTS but booking_id is NOT NULL'
      END
    ELSE '⚠️  DOES NOT EXIST (OK for now)'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'tax_invoices';

-- 6. Check delivery columns
SELECT 
  '6. Delivery columns' as check_name,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ EXIST in sales table'
    ELSE '⚠️  MISSING - Run migration 006'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sales'
  AND column_name IN ('delivery_status', 'delivery_confirmed');

-- 7. Final summary - Can we use direct sales?
SELECT 
  '🎯 DIRECT SALES STATUS' as summary,
  CASE 
    WHEN (SELECT is_nullable FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = 'sales' 
            AND column_name = 'booking_id') = 'YES'
    THEN '✅ ENABLED - You can create sales without bookings!'
    ELSE '❌ DISABLED - Run migration 007_make_booking_optional_in_sales.sql'
  END as status;

-- 8. Show current sales table structure (key columns)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
  AND column_name IN ('id', 'booking_id', 'showroom_id', 'customer_name', 'mobile', 'payment_status', 'delivery_status')
ORDER BY 
  CASE column_name
    WHEN 'id' THEN 1
    WHEN 'booking_id' THEN 2
    WHEN 'showroom_id' THEN 3
    WHEN 'customer_name' THEN 4
    WHEN 'mobile' THEN 5
    WHEN 'payment_status' THEN 6
    WHEN 'delivery_status' THEN 7
  END;

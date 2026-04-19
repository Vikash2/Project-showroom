-- =====================================================
-- FIX: Add Delivery Tracking to SALES Table
-- Delivery is part of sales lifecycle, not booking
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Add delivery tracking fields to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivery_status TEXT 
  DEFAULT 'Pending' 
  CHECK (delivery_status IN ('Pending', 'Ready', 'In Transit', 'Delivered'));

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivered_by UUID 
  REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivery_confirmed BOOLEAN DEFAULT false;

-- 2. Add indexes for delivery queries
CREATE INDEX IF NOT EXISTS idx_sales_delivery_status ON public.sales(delivery_status);
CREATE INDEX IF NOT EXISTS idx_sales_delivered_by ON public.sales(delivered_by);
CREATE INDEX IF NOT EXISTS idx_sales_delivery_confirmed ON public.sales(delivery_confirmed);

-- 3. Update sales status constraint to include Delivered
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_status_check;
ALTER TABLE public.sales ADD CONSTRAINT sales_status_check
  CHECK (status IN (
    'Processing',
    'Pending Approval',
    'Sales Finalized',
    'Ready for Payment',
    'Payment Complete',
    'Delivered',
    'Cancelled'
  ));

-- 4. Verification queries
DO $
BEGIN
  RAISE NOTICE '✅ Checking new delivery columns in sales table...';
END $;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
  AND column_name IN (
    'delivery_status',
    'delivered_at',
    'delivered_by',
    'delivery_notes',
    'delivery_confirmed'
  )
ORDER BY column_name;

-- 5. Check indexes
DO $
BEGIN
  RAISE NOTICE '✅ Checking delivery indexes...';
END $;

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sales'
  AND indexname LIKE '%delivery%'
ORDER BY indexname;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ DELIVERY TRACKING ADDED TO SALES TABLE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was added:';
  RAISE NOTICE '   ✓ delivery_status column (Pending/Ready/In Transit/Delivered)';
  RAISE NOTICE '   ✓ delivered_at timestamp';
  RAISE NOTICE '   ✓ delivered_by user reference';
  RAISE NOTICE '   ✓ delivery_notes text field';
  RAISE NOTICE '   ✓ delivery_confirmed boolean flag';
  RAISE NOTICE '   ✓ Indexes for delivery queries';
  RAISE NOTICE '   ✓ Updated status constraint';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Domain Separation:';
  RAISE NOTICE '   • Booking = Pre-sales (inquiry, reservation)';
  RAISE NOTICE '   • Sales = Post-sales (documents, payment, DELIVERY)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next Steps:';
  RAISE NOTICE '   1. Update backend confirmDelivery() to use sales table';
  RAISE NOTICE '   2. Update frontend to read delivery from sale object';
  RAISE NOTICE '   3. Remove any bookings.delivery_confirmed references';
  RAISE NOTICE '';
END $;

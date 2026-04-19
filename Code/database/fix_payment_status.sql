-- =====================================================
-- FIX: Ensure Payment Status is Consistent
-- Run this if delivery validation is failing
-- =====================================================

-- 1. Check current state of bookings with payment issues
SELECT 
  b.id as booking_id,
  b.status as booking_status,
  b.payment_confirmed,
  s.id as sale_id,
  s.status as sale_status,
  s.payment_status,
  s.delivery_status,
  s.delivery_confirmed,
  CASE 
    WHEN s.payment_status = 'Completed' OR b.payment_confirmed = true OR s.status = 'Payment Complete' 
    THEN 'READY FOR DELIVERY'
    ELSE 'PAYMENT INCOMPLETE'
  END as delivery_eligibility
FROM bookings b
LEFT JOIN sales s ON s.booking_id = b.id
WHERE b.status IN ('Payment Complete', 'Sales Finalized', 'Ready for Payment')
  AND s.delivery_confirmed = false
ORDER BY b.created_at DESC;

-- 2. Fix bookings where payment was confirmed but flags not set
-- (Run this only if you see bookings that should be payment complete)

-- UNCOMMENT AND MODIFY THE BOOKING ID BELOW:
/*
UPDATE bookings 
SET 
  payment_confirmed = true,
  status = 'Payment Complete',
  updated_at = NOW()
WHERE id = '<YOUR-BOOKING-ID-HERE>'
  AND payment_confirmed = false;

UPDATE sales 
SET 
  payment_status = 'Completed',
  status = 'Payment Complete',
  updated_at = NOW()
WHERE booking_id = '<YOUR-BOOKING-ID-HERE>'
  AND payment_status != 'Completed';
*/

-- 3. Verify the fix
SELECT 
  b.id as booking_id,
  b.status as booking_status,
  b.payment_confirmed,
  s.status as sale_status,
  s.payment_status,
  'READY FOR DELIVERY' as status
FROM bookings b
JOIN sales s ON s.booking_id = b.id
WHERE b.id = '<YOUR-BOOKING-ID-HERE>';

-- 4. Check all sales ready for delivery
SELECT 
  b.id as booking_id,
  b.customer_name,
  b.mobile,
  s.status as sale_status,
  s.payment_status,
  s.delivery_status,
  CASE 
    WHEN s.delivery_confirmed = true THEN 'DELIVERED'
    WHEN s.payment_status = 'Completed' OR b.payment_confirmed = true THEN 'READY FOR DELIVERY'
    ELSE 'PAYMENT PENDING'
  END as current_stage
FROM bookings b
JOIN sales s ON s.booking_id = b.id
WHERE s.status IN ('Payment Complete', 'Sales Finalized')
  AND s.delivery_confirmed = false
ORDER BY b.created_at DESC
LIMIT 20;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- This script helps diagnose and fix payment status issues.
-- 
-- Common scenarios:
-- 1. Payment was confirmed but payment_status not set to "Completed"
-- 2. booking.payment_confirmed is true but sale.payment_status is still "Pending"
-- 3. Status is "Payment Complete" but payment_status field is wrong
-- 
-- The delivery validation now checks ALL THREE indicators:
-- - sale.payment_status === "Completed"
-- - booking.payment_confirmed === true
-- - sale.status === "Payment Complete"
-- 
-- At least ONE must be true for delivery to work.
-- =====================================================

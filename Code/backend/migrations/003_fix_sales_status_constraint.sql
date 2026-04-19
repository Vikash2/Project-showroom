-- Migration: Fix sales status constraint
-- Date: 2026-04-12
-- Description: Update status constraint to allow proper sales workflow statuses

-- Step 1: Drop the existing constraint
ALTER TABLE sales 
DROP CONSTRAINT IF EXISTS sales_status_check;

-- Step 2: Add new constraint with correct status values
ALTER TABLE sales 
ADD CONSTRAINT sales_status_check 
CHECK (status IN (
  'Processing',
  'Pending Approval',
  'Sales Finalized',
  'Ready for Payment',
  'Payment Complete',
  'Delivered',
  'Cancelled'
));

-- Verification query
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name = 'sales_status_check';

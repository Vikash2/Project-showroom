-- Migration: Fix other_charges column type in sales table
-- Date: 2026-04-12
-- Description: Change other_charges from numeric to jsonb to store extended sale details

-- Step 1: Drop existing default value
ALTER TABLE sales 
ALTER COLUMN other_charges DROP DEFAULT;

-- Step 2: Change column type from numeric to jsonb
-- This will convert existing numeric values to JSON objects
ALTER TABLE sales 
ALTER COLUMN other_charges TYPE jsonb 
USING CASE 
  WHEN other_charges IS NULL THEN NULL
  WHEN other_charges = 0 THEN '{}'::jsonb
  ELSE jsonb_build_object('amount', other_charges)
END;

-- Step 3: Set new default value to empty JSON object
ALTER TABLE sales 
ALTER COLUMN other_charges SET DEFAULT '{}'::jsonb;

-- Step 3: Add comment to document the column purpose
COMMENT ON COLUMN sales.other_charges IS 'JSONB column storing extended sale details: soldThrough, typeOfSale, registration, insurance, insuranceType, insuranceNominee, hypothecationSelected, hypothecationCharge, otherState, financer, financeBy, exchange, selectedAccessoriesFinal, accessoriesTotal, discount, specialDiscount, specialDiscountApprovalStatus, isGstNumber, gstNumber, jobClub, otherChargesAmount, documents';

-- Verification query (run this to confirm the migration worked)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'sales' AND column_name = 'other_charges';

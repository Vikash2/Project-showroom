-- =====================================================
-- PHASE 5: BASIC SALES FLOW ALIGNMENT
-- Sync roles and add necessary fields for basic sales flow
-- Customer → Sales Executive → Cashier → Complete
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- 1. UPDATE USER ROLES (Add all missing roles)
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add updated constraint with all roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN (
    'Super Admin',
    'Showroom Manager',
    'Sales Executive',
    'Cashier',
    'Accountant',
    'Documentation Officer',
    'Financer',
    'Exchanger',
    'PDI Officer',
    'Accessories'
  ));

-- =====================================================
-- 2. UPDATE BOOKINGS TABLE (Add sales flow fields)
-- =====================================================

-- Add cashier-related fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cashier_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_collected_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS money_receipt_number TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS money_receipt_issued_at TIMESTAMPTZ;

-- Add invoice fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tax_invoice_number TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tax_invoice_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tax_invoice_approved_at TIMESTAMPTZ;

-- Add insurance/registration hold flags
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS insurance_on_hold BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS registration_on_hold BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hold_reason TEXT;

-- Add PDI fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pdi_status TEXT DEFAULT 'Pending' CHECK (pdi_status IN ('Pending', 'In Progress', 'Completed'));
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pdi_completed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pdi_completed_at TIMESTAMPTZ;

-- Add accessories issuance fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS accessories_issued BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS accessories_issued_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS accessories_issued_at TIMESTAMPTZ;

-- =====================================================
-- 3. UPDATE SALES TABLE (Add detailed pricing fields)
-- =====================================================

-- Add finance details (for future use, but structure ready)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS finance_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS down_payment NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS processing_fee_fn NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS processing_fee_sr NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payout NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'None' CHECK (finance_status IN ('None', 'Pending', 'Approved', 'Rejected'));
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS finance_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMPTZ;

-- Add exchange details (for future use, but structure ready)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_model TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_year INTEGER;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_registration_number TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_value NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_status TEXT DEFAULT 'None' CHECK (exchange_status IN ('None', 'Pending', 'Approved', 'Rejected'));
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS exchange_approved_at TIMESTAMPTZ;

-- Add extended warranty
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS extended_warranty BOOLEAN DEFAULT false;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS extended_warranty_amount NUMERIC(12, 2) DEFAULT 0;

-- Add cashier fields
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cashier_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS money_receipt_number TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS tax_invoice_number TEXT;

-- Add payment breakdown
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS balance_due NUMERIC(12, 2) DEFAULT 0;

-- =====================================================
-- 4. CREATE MONEY RECEIPTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.money_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque')),
  transaction_reference TEXT,
  issued_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_money_receipts_booking_id ON public.money_receipts(booking_id);
CREATE INDEX IF NOT EXISTS idx_money_receipts_sale_id ON public.money_receipts(sale_id);
CREATE INDEX IF NOT EXISTS idx_money_receipts_receipt_number ON public.money_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_money_receipts_issued_by ON public.money_receipts(issued_by);

-- =====================================================
-- 5. CREATE TAX INVOICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tax_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_mobile TEXT,
  customer_email TEXT,
  gst_number TEXT,
  vehicle_details JSONB NOT NULL,
  pricing_breakdown JSONB NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  approved_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_invoices_booking_id ON public.tax_invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_sale_id ON public.tax_invoices(sale_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_invoice_number ON public.tax_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_approved_by ON public.tax_invoices(approved_by);

-- =====================================================
-- 6. UPDATE RLS POLICIES
-- =====================================================

-- Update sales policy to include all new roles
DROP POLICY IF EXISTS "Sales team can manage sales" ON public.sales;
CREATE POLICY "Sales team can manage sales"
  ON public.sales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
        AND role IN (
          'Super Admin',
          'Showroom Manager',
          'Sales Executive',
          'Cashier',
          'Accountant',
          'Documentation Officer',
          'Financer',
          'Exchanger',
          'PDI Officer',
          'Accessories'
        )
    )
  );

-- Update bookings policy
DROP POLICY IF EXISTS "Sales team can manage bookings" ON public.bookings;
CREATE POLICY "Sales team can manage bookings"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
        AND role IN (
          'Super Admin',
          'Showroom Manager',
          'Sales Executive',
          'Cashier',
          'Accountant',
          'Documentation Officer',
          'Financer',
          'Exchanger',
          'PDI Officer',
          'Accessories'
        )
    )
  );

-- Enable RLS on new tables
ALTER TABLE public.money_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for money_receipts
CREATE POLICY "Users can read showroom receipts"
  ON public.money_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.users u ON u.id = auth.uid()
      WHERE b.id = money_receipts.booking_id
        AND (u.role = 'Super Admin' OR u.showroom_id = b.showroom_id)
    )
  );

CREATE POLICY "Cashiers and admins can manage receipts"
  ON public.money_receipts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('Super Admin', 'Showroom Manager', 'Cashier', 'Accountant')
    )
  );

-- RLS Policies for tax_invoices
CREATE POLICY "Users can read showroom invoices"
  ON public.tax_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.users u ON u.id = auth.uid()
      WHERE b.id = tax_invoices.booking_id
        AND (u.role = 'Super Admin' OR u.showroom_id = b.showroom_id)
    )
  );

CREATE POLICY "Cashiers and admins can manage invoices"
  ON public.tax_invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('Super Admin', 'Showroom Manager', 'Cashier', 'Accountant')
    )
  );

-- =====================================================
-- 7. ADD TRIGGERS FOR NEW TABLES
-- =====================================================

-- Trigger for money_receipts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_money_receipts_updated_at') THEN
    CREATE TRIGGER update_money_receipts_updated_at 
    BEFORE UPDATE ON public.money_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger for tax_invoices
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tax_invoices_updated_at') THEN
    CREATE TRIGGER update_tax_invoices_updated_at 
    BEFORE UPDATE ON public.tax_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to generate money receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $
DECLARE
  next_num INTEGER;
  receipt_num TEXT;
BEGIN
  -- Get the next sequence number for today
  SELECT COUNT(*) + 1 INTO next_num
  FROM public.money_receipts
  WHERE DATE(issued_at) = CURRENT_DATE;
  
  -- Format: MR-YYYYMMDD-NNNN
  receipt_num := 'MR-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN receipt_num;
END;
$ LANGUAGE plpgsql;

-- Function to generate tax invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $
DECLARE
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  -- Get the next sequence number for this financial year
  SELECT COUNT(*) + 1 INTO next_num
  FROM public.tax_invoices
  WHERE EXTRACT(YEAR FROM generated_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Format: INV-YYYY-NNNN
  invoice_num := 'INV-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_cashier_id ON public.bookings(cashier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pdi_status ON public.bookings(pdi_status);
CREATE INDEX IF NOT EXISTS idx_bookings_pdi_completed_by ON public.bookings(pdi_completed_by);
CREATE INDEX IF NOT EXISTS idx_bookings_accessories_issued ON public.bookings(accessories_issued);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_cashier_id ON public.sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_finance_status ON public.sales(finance_status);
CREATE INDEX IF NOT EXISTS idx_sales_exchange_status ON public.sales(exchange_status);

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check if all roles are in the constraint
DO $
BEGIN
  RAISE NOTICE '✅ Checking role constraint...';
END $;

SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname = 'users_role_check';

-- List all new columns in bookings
DO $
BEGIN
  RAISE NOTICE '✅ New columns in bookings table:';
END $;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
  AND column_name IN (
    'cashier_id', 'payment_collected_at', 'money_receipt_number',
    'tax_invoice_number', 'insurance_on_hold', 'registration_on_hold',
    'pdi_status', 'accessories_issued'
  )
ORDER BY column_name;

-- List all new columns in sales
DO $
BEGIN
  RAISE NOTICE '✅ New columns in sales table:';
END $;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales'
  AND column_name IN (
    'finance_amount', 'exchange_value', 'extended_warranty',
    'cashier_id', 'money_receipt_number', 'tax_invoice_number',
    'total_amount', 'amount_paid', 'balance_due'
  )
ORDER BY column_name;

-- Check new tables exist
DO $
BEGIN
  RAISE NOTICE '✅ Checking new tables...';
END $;

SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('money_receipts', 'tax_invoices')
ORDER BY table_name;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ PHASE 5: BASIC SALES FLOW - COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was added:';
  RAISE NOTICE '   ✓ All user roles synced (10 roles total)';
  RAISE NOTICE '   ✓ Cashier workflow fields added';
  RAISE NOTICE '   ✓ Money receipts table created';
  RAISE NOTICE '   ✓ Tax invoices table created';
  RAISE NOTICE '   ✓ PDI and accessories tracking added';
  RAISE NOTICE '   ✓ Finance and exchange fields (for future)';
  RAISE NOTICE '   ✓ RLS policies updated';
  RAISE NOTICE '   ✓ Helper functions for receipt/invoice numbers';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Create cashier users via admin dashboard';
  RAISE NOTICE '   2. Implement cashier payment collection API';
  RAISE NOTICE '   3. Implement receipt generation API';
  RAISE NOTICE '   4. Implement invoice approval API';
  RAISE NOTICE '   5. Test complete sales flow';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Basic Sales Flow Ready:';
  RAISE NOTICE '   Customer → Sales Executive → Cashier → Complete';
  RAISE NOTICE '';
END $;


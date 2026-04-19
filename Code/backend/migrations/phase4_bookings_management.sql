-- =====================================================
-- PHASE 4: BOOKINGS & SALES MANAGEMENT
-- Database Migration for Supabase
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Update Booking status constraints
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'Pending', 'Confirmed', 'Documentation In-Progress', 'Stock Allocated', 
    'Pending Approval', 'Sales Finalized', 'Payment Pending', 'Payment Complete',
    'RTO Processing', 'PDI Scheduled', 'Ready for Delivery', 'Delivered', 'Cancelled'
  ));

-- 2. Add Booking allocation columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS chassis_number TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS engine_number TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS delivery_confirmed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT false;

-- 3. Update Sales table constraints and schema mapping
-- Add columns to sales table supporting discounting and approval
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS requested_discount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS special_discount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS special_discount_status TEXT DEFAULT 'None' CHECK (special_discount_status IN ('None', 'Pending', 'Approved', 'Rejected'));
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS transaction_reference TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS base_pricing JSONB DEFAULT '{}'; -- Capture breakdown locally
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS other_charges NUMERIC(12, 2) DEFAULT 0;

-- 4. Create booking_payments tracking table
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Bank Transfer', 'Finance', 'Cheque')),
  transaction_reference TEXT,
  receipt_number TEXT UNIQUE,
  status TEXT DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  collected_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON public.booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_status ON public.booking_payments(status);

-- 5. Add updated_at trigger for booking_payments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_booking_payments_updated_at') THEN
    CREATE TRIGGER update_booking_payments_updated_at BEFORE UPDATE ON public.booking_payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 6. Enable RLS on new tables
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for booking_payments
CREATE POLICY "Users can read showroom payments"
  ON public.booking_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.users u ON u.id = auth.uid()
      WHERE b.id = booking_payments.booking_id
        AND (u.role = 'Super Admin' OR u.showroom_id = b.showroom_id)
    )
  );

CREATE POLICY "Sales team can manage payments"
  ON public.booking_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('Super Admin', 'Showroom Manager', 'Sales Executive', 'Accountant', 'Cashier')
    )
  );

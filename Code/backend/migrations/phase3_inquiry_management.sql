-- =====================================================
-- PHASE 3: INQUIRY & LEAD MANAGEMENT
-- Database Migration for Supabase
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Update leads table status constraint to match full pipeline
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN (
    'New',
    'Contacted',
    'Follow-up',
    'Test Ride Scheduled',
    'Hot Lead',
    'Quotation Sent',
    'Booking Done',
    'Lost',
    'Closed'
  ));

-- 2. Add missing columns to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS variant_preference TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS color_preference TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS exchange_vehicle TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS finance_required BOOLEAN DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Create inquiry_tasks table for follow-up task management
CREATE TABLE IF NOT EXISTS public.inquiry_tasks (
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
);

CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_inquiry_id ON public.inquiry_tasks(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_status ON public.inquiry_tasks(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_assigned_to ON public.inquiry_tasks(assigned_to);

-- 4. Create inquiry_history table for communication logs
CREATE TABLE IF NOT EXISTS public.inquiry_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Call', 'SMS', 'WhatsApp', 'Email', 'Visit', 'Test Ride', 'Note', 'Status Change')),
  summary TEXT NOT NULL,
  details TEXT,
  outcome TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_history_inquiry_id ON public.inquiry_history(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_history_type ON public.inquiry_history(type);

-- 5. Add updated_at triggers for new tables
CREATE TRIGGER update_inquiry_tasks_updated_at BEFORE UPDATE ON public.inquiry_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS on new tables
ALTER TABLE public.inquiry_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_history ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for inquiry_tasks
CREATE POLICY "Users can read showroom inquiry tasks"
  ON public.inquiry_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      JOIN public.users u ON u.id = auth.uid()
      WHERE l.id = inquiry_tasks.inquiry_id
        AND (u.role = 'Super Admin' OR u.showroom_id = l.showroom_id)
    )
  );

CREATE POLICY "Sales team can manage inquiry tasks"
  ON public.inquiry_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('Super Admin', 'Showroom Manager', 'Sales Executive')
    )
  );

-- 8. RLS Policies for inquiry_history
CREATE POLICY "Users can read showroom inquiry history"
  ON public.inquiry_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      JOIN public.users u ON u.id = auth.uid()
      WHERE l.id = inquiry_history.inquiry_id
        AND (u.role = 'Super Admin' OR u.showroom_id = l.showroom_id)
    )
  );

CREATE POLICY "Sales team can manage inquiry history"
  ON public.inquiry_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('Super Admin', 'Showroom Manager', 'Sales Executive')
    )
  );

-- 9. Add index for is_active filter on leads
CREATE INDEX IF NOT EXISTS idx_leads_is_active ON public.leads(is_active);

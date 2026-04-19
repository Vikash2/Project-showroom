-- =====================================================
-- ADD DOCUMENTS COLUMN TO SALES TABLE
-- This allows storing document metadata for each sale
-- =====================================================

-- Add documents column to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{
  "aadharCard": {},
  "panCard": {},
  "drivingLicense": {},
  "addressProof": {},
  "passportPhotos": {}
}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.sales.documents IS 'Stores document metadata including file URLs, upload timestamps, and document status';

-- Create index for faster document queries
CREATE INDEX IF NOT EXISTS idx_sales_documents ON public.sales USING GIN (documents);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'sales' AND column_name = 'documents';

-- =====================================================
-- DOCUMENT STRUCTURE EXAMPLE
-- =====================================================
-- {
--   "aadharCard": {
--     "file": {
--       "name": "aadhar.jpg",
--       "type": "image/jpeg",
--       "url": "https://...supabase.co/storage/v1/object/public/documents/sales/123/...",
--       "path": "sales/123/123_aadharCard_1234567890.jpg",
--       "uploadedAt": "2026-04-15T10:30:00.000Z",
--       "uploadedBy": "user-uuid"
--     }
--   },
--   "panCard": { ... },
--   "drivingLicense": { ... },
--   "addressProof": { ... },
--   "passportPhotos": { ... }
-- }

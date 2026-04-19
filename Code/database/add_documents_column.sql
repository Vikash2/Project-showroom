-- =====================================================
-- ADD DOCUMENTS COLUMN TO BOOKINGS TABLE
-- This allows storing document metadata for each booking
-- =====================================================

-- Add documents column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{
  "aadharCard": {},
  "panCard": {},
  "drivingLicense": {},
  "addressProof": {},
  "passportPhotos": {}
}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.bookings.documents IS 'Stores document metadata including file URLs, upload timestamps, and document status';

-- Create index for faster document queries
CREATE INDEX IF NOT EXISTS idx_bookings_documents ON public.bookings USING GIN (documents);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'documents';

-- =====================================================
-- DOCUMENT STRUCTURE EXAMPLE
-- =====================================================
-- {
--   "aadharCard": {
--     "file": {
--       "name": "aadhar.jpg",
--       "type": "image/jpeg",
--       "url": "https://...supabase.co/storage/v1/object/public/documents/bookings/123/...",
--       "path": "bookings/123/123_aadharCard_1234567890.jpg",
--       "uploadedAt": "2026-04-15T10:30:00.000Z",
--       "uploadedBy": "user-uuid"
--     }
--   },
--   "panCard": { ... },
--   "drivingLicense": { ... },
--   "addressProof": { ... },
--   "passportPhotos": { ... }
-- }

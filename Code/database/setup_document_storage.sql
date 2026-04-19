-- =====================================================
-- DOCUMENT STORAGE SETUP
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

-- Create the documents bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true, -- Public bucket for easy access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. SET UP RLS POLICIES FOR STORAGE
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;

-- Policy: Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'bookings'
);

-- Policy: Allow authenticated users to read documents
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Policy: Allow authenticated users to delete their own documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'bookings'
);

-- Policy: Allow authenticated users to update documents
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'bookings'
);

-- =====================================================
-- 3. VERIFY SETUP
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%documents%';

-- =====================================================
-- 4. TEST UPLOAD (Optional)
-- =====================================================

-- You can test upload via Supabase Dashboard:
-- 1. Go to Storage > documents bucket
-- 2. Create folder: bookings/test-booking-id
-- 3. Upload a test file
-- 4. Verify it appears in the bucket
-- 5. Get public URL and test access

-- =====================================================
-- NOTES
-- =====================================================

-- File Structure:
-- documents/
--   └── bookings/
--       └── {bookingId}/
--           ├── {bookingId}_aadharCard_{timestamp}.jpg
--           ├── {bookingId}_panCard_{timestamp}.pdf
--           ├── {bookingId}_drivingLicense_{timestamp}.jpg
--           ├── {bookingId}_addressProof_{timestamp}.pdf
--           └── {bookingId}_passportPhotos_{timestamp}.jpg

-- Public URL Format:
-- https://{project-ref}.supabase.co/storage/v1/object/public/documents/bookings/{bookingId}/{filename}

-- Access Control:
-- - All authenticated users can upload, read, update, and delete documents
-- - Public bucket allows unauthenticated read access (for viewing documents)
-- - Files are organized by booking ID for easy management

-- Security Considerations:
-- - File size limited to 10MB
-- - Only specific MIME types allowed (images and PDFs)
-- - Files are organized in booking-specific folders
-- - RLS policies ensure only authenticated users can modify

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If uploads fail with "new row violates row-level security policy":
-- 1. Verify RLS policies are created correctly
-- 2. Check that user is authenticated
-- 3. Verify bucket_id matches 'documents'
-- 4. Check file path starts with 'bookings/'

-- If files don't appear in storage:
-- 1. Check Supabase logs for errors
-- 2. Verify service role key is correct in backend .env
-- 3. Check network connectivity
-- 4. Verify file size is under 10MB

-- If public URLs don't work:
-- 1. Verify bucket is set to public
-- 2. Check URL format is correct
-- 3. Verify file exists in storage
-- 4. Check CORS settings if accessing from browser


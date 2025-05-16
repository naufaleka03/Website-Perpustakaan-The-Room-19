-- Create a public bucket for verification IDs (if it doesn't exist already)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-ids', 'Verification IDs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Even though the bucket is public, we need policies to control who can upload/modify files

-- UPLOAD POLICY: Allow authenticated users to upload their own verification documents
-- This ensures users can only upload to their own user_id folder
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'verification-ids' AND 
  name LIKE auth.uid() || '/%'
);

-- UPDATE POLICY: Allow users to update only their own documents
CREATE POLICY "Users can update their own verification documents" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'verification-ids' AND 
  name LIKE auth.uid() || '/%'
);

-- DELETE POLICY: Allow users to delete only their own documents
CREATE POLICY "Users can delete their own verification documents" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'verification-ids' AND 
  name LIKE auth.uid() || '/%'
);

-- SELECT POLICY: Allow authenticated users to view their own documents
-- This isn't strictly necessary for a public bucket, but it's good to have for consistency
CREATE POLICY "Users can view their own verification documents" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'verification-ids' AND 
  name LIKE auth.uid() || '/%'
);

-- STAFF ACCESS POLICY: Allow staff members to view all verification documents
-- This allows staff to review uploaded ID cards
CREATE POLICY "Staff can view all verification documents" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'verification-ids' AND 
  EXISTS (
    SELECT 1 FROM staffs 
    WHERE staffs.id = auth.uid()
  )
); 
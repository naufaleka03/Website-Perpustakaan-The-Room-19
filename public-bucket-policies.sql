-- Create a public bucket (if it doesn't exist already)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'Public', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Even though the bucket is public, we need policies to control who can upload/modify files

-- UPLOAD POLICY: Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'public' AND 
  (name LIKE 'verification-ids/' || auth.uid() || '/%')
);

-- UPDATE POLICY: Allow users to update only their own documents
CREATE POLICY "Users can update their own verification documents" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'public' AND 
  (name LIKE 'verification-ids/' || auth.uid() || '/%')
);

-- DELETE POLICY: Allow users to delete only their own documents
CREATE POLICY "Users can delete their own verification documents" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'public' AND 
  (name LIKE 'verification-ids/' || auth.uid() || '/%')
);

-- SELECT POLICY: Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own verification documents" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'public' AND 
  (name LIKE 'verification-ids/' || auth.uid() || '/%')
);

-- STAFF ACCESS POLICY: Allow staff members to view all verification documents
CREATE POLICY "Staff can view all verification documents" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'public' AND 
  name LIKE 'verification-ids/%' AND
  EXISTS (
    SELECT 1 FROM staffs 
    WHERE staffs.id = auth.uid()
  )
); 
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos'
  AND auth.uid()::text = left(name, 36) -- nếu tên file bắt đầu bằng user id
);


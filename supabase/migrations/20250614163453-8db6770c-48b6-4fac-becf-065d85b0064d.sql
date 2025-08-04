
-- Fix: Split admin storage RLS policy for update and delete actions

-- Admin can UPDATE images in lovable_uploads bucket
CREATE POLICY "Admin can update images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lovable_uploads'
    AND (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- Admin can DELETE images in lovable_uploads bucket
CREATE POLICY "Admin can delete images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lovable_uploads'
    AND (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

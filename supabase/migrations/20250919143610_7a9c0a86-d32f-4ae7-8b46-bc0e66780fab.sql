-- Create storage buckets for branding and general files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('branding', 'branding', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('files', 'files', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf', 'text/plain']);

-- Create RLS policies for branding bucket
CREATE POLICY "Admins can upload branding files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public can view branding files" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');

CREATE POLICY "Admins can update branding files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete branding files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for files bucket  
CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'files' AND auth.uid() IS NOT NULL);
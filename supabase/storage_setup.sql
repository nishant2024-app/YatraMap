-- Supabase Storage Bucket Setup for YatraMap
-- Run this in Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('stall-images', 'stall-images', true),
  ('about-images', 'about-images', true),
  ('sponsor-images', 'sponsor-images', true),
  ('donate-qr', 'donate-qr', true),
  ('welcome-images', 'welcome-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for all buckets
CREATE POLICY "Public read access for stall-images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'stall-images');

CREATE POLICY "Public read access for about-images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'about-images');

CREATE POLICY "Public read access for sponsor-images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'sponsor-images');

CREATE POLICY "Public read access for donate-qr" ON storage.objects 
  FOR SELECT USING (bucket_id = 'donate-qr');

CREATE POLICY "Public read access for welcome-images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'welcome-images');

-- Admin-only write access for all buckets
CREATE POLICY "Admin write access for stall-images" ON storage.objects 
  FOR ALL USING (bucket_id = 'stall-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin write access for about-images" ON storage.objects 
  FOR ALL USING (bucket_id = 'about-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin write access for sponsor-images" ON storage.objects 
  FOR ALL USING (bucket_id = 'sponsor-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin write access for donate-qr" ON storage.objects 
  FOR ALL USING (bucket_id = 'donate-qr' AND auth.role() = 'authenticated');

CREATE POLICY "Admin write access for welcome-images" ON storage.objects 
  FOR ALL USING (bucket_id = 'welcome-images' AND auth.role() = 'authenticated');

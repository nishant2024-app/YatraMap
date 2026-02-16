-- YatraMap Image Support Migration
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

-- Add images column to stalls table
ALTER TABLE stalls ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add images column to about_content table
ALTER TABLE about_content ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add image_url to sponsors (in addition to existing logo_url)
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create welcome_popup table
CREATE TABLE IF NOT EXISTS welcome_popup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on welcome_popup
ALTER TABLE welcome_popup ENABLE ROW LEVEL SECURITY;

-- Public read policy for welcome_popup
CREATE POLICY "Allow public read on welcome_popup" ON welcome_popup 
  FOR SELECT USING (true);

-- Admin write policy for welcome_popup
CREATE POLICY "Allow admin write on welcome_popup" ON welcome_popup 
  FOR ALL USING (auth.role() = 'authenticated');

-- Update donate_info to ensure qr column exists (it already has upi_qr_url)
-- No change needed as upi_qr_url already exists

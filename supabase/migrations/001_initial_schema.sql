-- YatraMap Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stalls table
CREATE TABLE IF NOT EXISTS stalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stall_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 2,
  height INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Map elements table (roads, spaces)
CREATE TABLE IF NOT EXISTS map_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('road', 'space')) NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  tier TEXT CHECK (tier IN ('platinum', 'gold', 'supporter')),
  message TEXT,
  display_order INTEGER DEFAULT 0
);

-- About content table (single row)
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB DEFAULT '{}'::jsonb
);

-- Donate info table (single row)
CREATE TABLE IF NOT EXISTS donate_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_name TEXT,
  purpose_text TEXT,
  upi_qr_url TEXT
);

-- Enable Row Level Security
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE donate_info ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read on stalls" ON stalls FOR SELECT USING (true);
CREATE POLICY "Allow public read on map_elements" ON map_elements FOR SELECT USING (true);
CREATE POLICY "Allow public read on sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Allow public read on about_content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Allow public read on donate_info" ON donate_info FOR SELECT USING (true);

-- Admin write policies (authenticated users)
CREATE POLICY "Allow admin write on stalls" ON stalls FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on map_elements" ON map_elements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on sponsors" ON sponsors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on about_content" ON about_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on donate_info" ON donate_info FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data (optional)
INSERT INTO about_content (content) VALUES ('{
  "history": "The Mangrulpir Yatra is a centuries-old tradition celebrating our village deity.",
  "importance": "This sacred gathering brings together devotees from across the region.",
  "schedule": "Main festivities span 3 days with daily pujas and cultural programs.",
  "committee_message": "We welcome all devotees to join us in this auspicious celebration."
}'::jsonb);

INSERT INTO donate_info (committee_name, purpose_text) VALUES (
  'Shri Yatra Samiti, Mangrulpir',
  'Your generous donations help organize the annual Yatra, maintain temple facilities, and support community welfare activities.'
);

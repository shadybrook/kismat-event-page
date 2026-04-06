-- ============================================
-- KISMAT EVENT REGISTRATIONS
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  instagram TEXT,
  payment_screenshot_url TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'submitted', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast lookups by event slug
CREATE INDEX IF NOT EXISTS idx_event_registrations_slug
  ON event_registrations (event_slug);

-- 3. Index for looking up by phone (to detect duplicates)
CREATE INDEX IF NOT EXISTS idx_event_registrations_phone
  ON event_registrations (event_slug, phone);

-- 4. Enable Row Level Security
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Allow anonymous inserts (so users can register without auth)
CREATE POLICY "Allow anonymous inserts"
  ON event_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 6. Policy: Allow anonymous updates (for adding screenshot URL after payment)
CREATE POLICY "Allow anonymous updates on own registration"
  ON event_registrations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 7. Policy: Allow authenticated users full read access (for admin dashboard)
CREATE POLICY "Allow authenticated read"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- 8. Create storage bucket for payment screenshots (run in Supabase Dashboard > Storage)
-- Bucket name: payment-screenshots
-- Public: Yes (so screenshot URLs work)
-- File size limit: 5 MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 9. Storage policy: Allow anonymous uploads
-- In Supabase Dashboard > Storage > payment-screenshots > Policies:
-- INSERT policy for anon role: (bucket_id = 'payment-screenshots')

-- TalentFit AI - Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Drop existing table (if any)
-- ============================================
DROP TABLE IF EXISTS history CASCADE;

-- ============================================
-- STEP 2: Create history table with correct schema
-- ============================================
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  candidate_count INTEGER NOT NULL,
  top_match_score NUMERIC(5,2) NOT NULL,
  results JSONB NOT NULL
);

-- Add index for faster queries
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_created_at ON history(created_at DESC);

-- ============================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Policy 1: Users can insert their own records
CREATE POLICY "Users can insert their own history"
ON history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own records
CREATE POLICY "Users can view their own history"
ON history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can delete their own records
CREATE POLICY "Users can delete their own history"
ON history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Verify setup (optional)
-- ============================================

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'history'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'history';

-- Check policies
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'history';

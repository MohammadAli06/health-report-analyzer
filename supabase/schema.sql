-- =====================================================
-- Medical Report Analysis Platform - CLEAN Schema
-- Run this in Supabase SQL Editor
-- This will DROP and recreate all tables
-- =====================================================

-- STEP 1: Drop any old triggers that reference auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- STEP 2: Drop old tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- STEP 3: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES
-- =====================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,  -- NO foreign key constraint to avoid trigger issues
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    blood_type TEXT,
    smoking_status TEXT,
    activity_level TEXT,
    known_conditions TEXT[],
    allergies TEXT[],
    medications TEXT[],
    role TEXT DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FAMILY MEMBERS
-- =====================================================
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT,
    date_of_birth DATE,
    gender TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    blood_type TEXT,
    known_conditions TEXT[],
    email TEXT,  -- Optional: link to another user's account
    linked_user_id UUID,  -- The user_id of the linked account
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTS
-- =====================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    file_url TEXT,
    file_name TEXT,
    patient_name TEXT,
    patient_age INTEGER,
    patient_gender TEXT,
    health_score INTEGER,
    summary TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEST RESULTS
-- =====================================================
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
    test_name TEXT NOT NULL,
    observed_value TEXT NOT NULL,
    unit TEXT,
    reference_min NUMERIC,
    reference_max NUMERIC,
    status TEXT,
    severity TEXT,
    explanation TEXT,
    alert_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI CONVERSATIONS
-- =====================================================
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REMINDERS
-- =====================================================
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    test_name TEXT,
    reminder_type TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_family_owner ON family_members(owner_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_family ON reports(family_member_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_test_results_report ON test_results(report_id);
CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_reminders_user ON reminders(user_id);

-- =====================================================
-- DISABLE RLS (keep it simple)
-- =====================================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;

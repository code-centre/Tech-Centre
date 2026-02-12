-- Migration: 20250211_add_blood_type_emergency_contact_to_profiles.sql
-- Description: Add blood type and emergency contact fields to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5),
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);

COMMENT ON COLUMN profiles.blood_type IS 'Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)';
COMMENT ON COLUMN profiles.emergency_contact_name IS 'Name of emergency contact person';
COMMENT ON COLUMN profiles.emergency_contact_phone IS 'Phone number of emergency contact';

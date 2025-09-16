-- Migration: Add gamification toggle to profiles
-- Date: 2024-09-15
-- Description: Allows users to enable/disable gamification features

-- Add gamification_enabled column to profiles table
ALTER TABLE profiles 
ADD COLUMN gamification_enabled BOOLEAN DEFAULT true;

-- Update existing profiles to have gamification enabled by default
UPDATE profiles 
SET gamification_enabled = true 
WHERE gamification_enabled IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.gamification_enabled IS 'Controls whether gamification features (XP, levels, streaks) are shown to the user';
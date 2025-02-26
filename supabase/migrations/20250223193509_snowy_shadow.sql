-- Add city and country columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(country, city);

-- Update existing profiles to split location into city and country
UPDATE profiles
SET
  country = CASE
    WHEN location LIKE '%United States%' THEN 'United States'
    WHEN location LIKE '%United Kingdom%' THEN 'United Kingdom'
    WHEN location LIKE '%Germany%' THEN 'Germany'
    WHEN location LIKE '%France%' THEN 'France'
    WHEN location LIKE '%Japan%' THEN 'Japan'
    WHEN location LIKE '%Australia%' THEN 'Australia'
    WHEN location LIKE '%Canada%' THEN 'Canada'
    WHEN location LIKE '%Singapore%' THEN 'Singapore'
    WHEN location LIKE '%India%' THEN 'India'
    WHEN location LIKE '%China%' THEN 'China'
    ELSE split_part(location, ', ', 2)
  END,
  city = split_part(location, ', ', 1)
WHERE location IS NOT NULL;
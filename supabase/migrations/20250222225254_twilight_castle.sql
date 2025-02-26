/*
  # Update Opportunities Schema

  1. Changes
    - Add currency field to opportunities table
    - Split location into country and city fields
    - Add new fields for enhanced opportunity details
    - Update existing location data

  2. Security
    - Maintain existing RLS policies
    - Add validation for new fields
*/

-- Add new columns to opportunities table
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS company_size text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS preferred_contact text CHECK (preferred_contact IN ('email', 'phone'));

-- Create a function to split location into country and city
CREATE OR REPLACE FUNCTION split_location()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update existing records
  UPDATE opportunities
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
END;
$$;

-- Execute the function to update existing data
SELECT split_location();

-- Add constraints after data is updated
ALTER TABLE opportunities
  ALTER COLUMN country SET NOT NULL,
  ALTER COLUMN city SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_currency ON opportunities(currency);
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities(country);
CREATE INDEX IF NOT EXISTS idx_opportunities_city ON opportunities(city);

-- Create a trigger to maintain the location field for backward compatibility
CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = NEW.city || ', ' || NEW.country;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_location_trigger
  BEFORE INSERT OR UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_location();

-- Add check constraint for currency
ALTER TABLE opportunities
  ADD CONSTRAINT valid_currency CHECK (
    currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'SGD')
  );
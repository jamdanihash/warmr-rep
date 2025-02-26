-- Add is_name_private column to opportunities table
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS is_name_private boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_is_name_private ON opportunities(is_name_private);

-- Update existing opportunities to have is_name_private set to false
UPDATE opportunities
SET is_name_private = false
WHERE is_name_private IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE opportunities
  ALTER COLUMN is_name_private SET NOT NULL;
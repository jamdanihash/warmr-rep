-- Add missing columns to opportunities table if they don't exist
DO $$ 
BEGIN
  -- Add columns if they don't exist
  BEGIN
    ALTER TABLE opportunities
      ADD COLUMN IF NOT EXISTS budget_min numeric,
      ADD COLUMN IF NOT EXISTS budget_max numeric,
      ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS company_size text,
      ADD COLUMN IF NOT EXISTS timeline text,
      ADD COLUMN IF NOT EXISTS requirements text,
      ADD COLUMN IF NOT EXISTS preferred_contact text;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  -- Add check constraint for preferred_contact if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'opportunities_preferred_contact_check'
  ) THEN
    ALTER TABLE opportunities
      ADD CONSTRAINT opportunities_preferred_contact_check 
      CHECK (preferred_contact IN ('email', 'phone'));
  END IF;

  -- Add check constraint for currency if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_currency'
  ) THEN
    ALTER TABLE opportunities
      ADD CONSTRAINT valid_currency CHECK (
        currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'SGD')
      );
  END IF;

  -- Add check constraint for timeline if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_timeline'
  ) THEN
    ALTER TABLE opportunities
      ADD CONSTRAINT valid_timeline CHECK (
        timeline IN ('immediate', 'soon', 'flexible', 'long-term')
      );
  END IF;

  -- Add check constraint for company_size if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_company_size'
  ) THEN
    ALTER TABLE opportunities
      ADD CONSTRAINT valid_company_size CHECK (
        company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')
      );
  END IF;
END $$;

-- Create indexes for better performance if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_opportunities_budget'
  ) THEN
    CREATE INDEX idx_opportunities_budget ON opportunities(budget_min, budget_max);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_opportunities_currency'
  ) THEN
    CREATE INDEX idx_opportunities_currency ON opportunities(currency);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_opportunities_company_size'
  ) THEN
    CREATE INDEX idx_opportunities_company_size ON opportunities(company_size);
  END IF;
END $$;
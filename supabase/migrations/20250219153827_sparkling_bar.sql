/*
  # Fix Opportunities Tables Migration

  1. Changes
    - Add existence checks for all table creations
    - Safely create tables, indexes, and policies
    - Preserve all functionality while avoiding conflicts
  
  2. Tables
    - opportunities
    - favorite_opportunities
    - opportunity_views
  
  3. Security
    - Row Level Security (RLS) policies
    - User-specific access controls
*/

-- Safely create opportunities table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'opportunities') THEN
    CREATE TABLE opportunities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      type text NOT NULL CHECK (type IN ('buying', 'selling')),
      business_name text NOT NULL,
      industry text NOT NULL,
      description text NOT NULL CHECK (length(description) <= 200),
      contact_email text NOT NULL,
      contact_phone text NOT NULL,
      location text NOT NULL,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

    -- Create indexes
    CREATE INDEX idx_opportunities_type ON opportunities(type);
    CREATE INDEX idx_opportunities_industry ON opportunities(industry);
    CREATE INDEX idx_opportunities_location ON opportunities(location);
    CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
    CREATE INDEX idx_opportunities_search ON opportunities USING gin(
      to_tsvector('english', business_name || ' ' || description)
    );
  END IF;
END $$;

-- Safely create favorite_opportunities table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorite_opportunities') THEN
    CREATE TABLE favorite_opportunities (
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
      is_favorite boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      PRIMARY KEY (user_id, opportunity_id)
    );

    -- Enable RLS
    ALTER TABLE favorite_opportunities ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create opportunity_views table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'opportunity_views') THEN
    CREATE TABLE opportunity_views (
      opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      viewed_at timestamptz DEFAULT now(),
      PRIMARY KEY (opportunity_id, user_id)
    );

    -- Enable RLS
    ALTER TABLE opportunity_views ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Safely create trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_opportunities_updated_at'
  ) THEN
    CREATE TRIGGER update_opportunities_updated_at
      BEFORE UPDATE ON opportunities
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Safely create policies (policies are automatically dropped when recreated)
DO $$ 
BEGIN
  -- Opportunities policies
  CREATE POLICY "Anyone can read opportunities"
    ON opportunities
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Users can create opportunities"
    ON opportunities
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own opportunities"
    ON opportunities
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own opportunities"
    ON opportunities
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Favorite opportunities policies
  CREATE POLICY "Users can manage their favorites"
    ON favorite_opportunities
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Opportunity views policies
  CREATE POLICY "Users can record their views"
    ON opportunity_views
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  -- Ignore policy already exists errors
  WHEN duplicate_object THEN NULL;
END $$;
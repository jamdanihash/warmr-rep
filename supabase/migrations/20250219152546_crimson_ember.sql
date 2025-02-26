/*
  # Business Opportunities Tables

  1. New Tables
    - `opportunities`
      - Core table for business opportunities (both buying and selling)
      - Includes all required fields for listings
    - `favorite_opportunities`
      - Junction table for users' favorite opportunities
    - `opportunity_views`
      - Tracks view counts for opportunities

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Reading opportunities (authenticated users)
      - Creating opportunities (authenticated users)
      - Managing favorites (authenticated users)
      - Tracking views (authenticated users)

  3. Indexes
    - Add indexes for common query patterns
*/

-- Create opportunities table
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

-- Create favorite opportunities table
CREATE TABLE favorite_opportunities (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  is_favorite boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
);

-- Create opportunity views table
CREATE TABLE opportunity_views (
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (opportunity_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_views ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunities
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

-- Create policies for favorite_opportunities
CREATE POLICY "Users can manage their favorites"
  ON favorite_opportunities
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for opportunity_views
CREATE POLICY "Users can record their views"
  ON opportunity_views
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_industry ON opportunities(industry);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX idx_opportunities_search ON opportunities USING gin(
  to_tsvector('english', business_name || ' ' || description)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get a sample user ID (you may want to adjust this in production)
  SELECT id INTO user_id FROM auth.users LIMIT 1;

  -- Insert sample buying opportunities
  INSERT INTO opportunities (
    type,
    business_name,
    industry,
    description,
    contact_email,
    contact_phone,
    location,
    user_id
  ) VALUES
    (
      'buying',
      'Tech Solutions Inc',
      'Technology',
      'Looking to acquire a software development company specializing in mobile applications. Target revenue $1-5M.',
      'acquire@techsolutions.com',
      '(555) 123-4567',
      'San Francisco',
      user_id
    ),
    (
      'buying',
      'Healthcare Innovations',
      'Healthcare',
      'Seeking to purchase medical equipment distribution business with established customer base.',
      'acquisitions@healthcare-innovations.com',
      '(555) 234-5678',
      'Boston',
      user_id
    );

  -- Insert sample selling opportunities
  INSERT INTO opportunities (
    type,
    business_name,
    industry,
    description,
    contact_email,
    contact_phone,
    location,
    user_id
  ) VALUES
    (
      'selling',
      'Retail Success',
      'Retail',
      'Profitable e-commerce business for sale. 5 years in operation, $2M annual revenue, strong growth potential.',
      'sale@retailsuccess.com',
      '(555) 345-6789',
      'New York',
      user_id
    ),
    (
      'selling',
      'Manufacturing Pro',
      'Manufacturing',
      'Well-established manufacturing facility specializing in precision parts. Turnkey operation with trained staff.',
      'sell@manufacturingpro.com',
      '(555) 456-7890',
      'Chicago',
      user_id
    );
END $$;
/*
  # Add requirements and calls functionality

  1. New Tables
    - `requirements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `budget_min` (numeric)
      - `budget_max` (numeric)
      - `deadline` (timestamptz)
      - `status` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `requirement_categories`
      - `requirement_id` (uuid, references requirements)
      - `category_id` (uuid, references industry_categories)
    
    - `calls`
      - `id` (uuid, primary key)
      - `requirement_id` (uuid, references requirements)
      - `prospect_id` (uuid, references prospects)
      - `caller_id` (uuid, references auth.users)
      - `scheduled_at` (timestamptz)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create requirements table
CREATE TABLE requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  budget_min numeric,
  budget_max numeric,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create requirement categories junction table
CREATE TABLE requirement_categories (
  requirement_id uuid REFERENCES requirements(id) ON DELETE CASCADE,
  category_id uuid REFERENCES industry_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (requirement_id, category_id)
);

-- Create calls table
CREATE TABLE calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid REFERENCES requirements(id) ON DELETE CASCADE,
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE,
  caller_id uuid REFERENCES auth.users(id),
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-answer', 'rescheduled'))
);

-- Enable RLS
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read all requirements"
  ON requirements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create requirements"
  ON requirements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own requirements"
  ON requirements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read all requirement categories"
  ON requirement_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their requirement categories"
  ON requirement_categories
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM requirements
    WHERE id = requirement_id AND created_by = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM requirements
    WHERE id = requirement_id AND created_by = auth.uid()
  ));

CREATE POLICY "Users can read all calls"
  ON calls
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create and manage their calls"
  ON calls
  FOR ALL
  TO authenticated
  USING (caller_id = auth.uid())
  WITH CHECK (caller_id = auth.uid());

-- Create function to find matching prospects for a requirement
CREATE OR REPLACE FUNCTION find_matching_prospects(
  requirement_id uuid,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  prospect_id uuid,
  company_name text,
  match_score double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH requirement_data AS (
    SELECT 
      r.*,
      array_agg(rc.category_id) as category_ids
    FROM requirements r
    LEFT JOIN requirement_categories rc ON rc.requirement_id = r.id
    WHERE r.id = requirement_id
    GROUP BY r.id
  )
  SELECT 
    p.id as prospect_id,
    p.company_name,
    (
      -- Base score starts at 1.0
      1.0 +
      -- Add points for matching categories
      CASE WHEN EXISTS (
        SELECT 1 FROM prospect_categories pc
        WHERE pc.prospect_id = p.id
        AND pc.category_id = ANY(rd.category_ids)
      ) THEN 0.5 ELSE 0 END +
      -- Add points for budget match
      CASE 
        WHEN p.annual_revenue BETWEEN rd.budget_min AND rd.budget_max THEN 0.3
        ELSE 0
      END
    )::double precision as match_score
  FROM prospects p, requirement_data rd
  WHERE 
    -- Only include prospects that haven't been called for this requirement
    NOT EXISTS (
      SELECT 1 FROM calls c
      WHERE c.requirement_id = requirement_id
      AND c.prospect_id = p.id
    )
  ORDER BY match_score DESC
  LIMIT limit_count;
END;
$$;
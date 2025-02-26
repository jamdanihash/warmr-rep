/*
  # Initial schema setup for prospects management

  1. Tables
    - industry_categories: Stores industry classifications
    - prospects: Main prospects table
    - prospect_categories: Junction table for prospect-category relationships
    - saved_searches: User-saved search criteria
    - prospect_lists: User-created prospect lists
    - prospect_list_items: Junction table for list-prospect relationships

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access
    - Secure search function
*/

-- Create industry categories table
CREATE TABLE industry_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES industry_categories(id),
  created_at timestamptz DEFAULT now()
);

-- Create prospects table
CREATE TABLE prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  description text,
  employee_count integer,
  annual_revenue numeric,
  website text,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create prospect categories junction table
CREATE TABLE prospect_categories (
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES industry_categories(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  PRIMARY KEY (prospect_id, category_id)
);

-- Create saved searches table
CREATE TABLE saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  search_criteria jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prospect lists table
CREATE TABLE prospect_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create prospect list items junction table
CREATE TABLE prospect_list_items (
  list_id uuid REFERENCES prospect_lists(id) ON DELETE CASCADE,
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (list_id, prospect_id)
);

-- Enable RLS
ALTER TABLE industry_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_list_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read industry categories"
  ON industry_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read prospects"
  ON prospects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create prospects"
  ON prospects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can read prospect categories"
  ON prospect_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their saved searches"
  ON saved_searches
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their prospect lists"
  ON prospect_lists
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their prospect list items"
  ON prospect_list_items
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM prospect_lists
    WHERE id = list_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM prospect_lists
    WHERE id = list_id AND user_id = auth.uid()
  ));

-- Create search function
CREATE OR REPLACE FUNCTION search_prospects(
  search_term text DEFAULT NULL,
  category_ids uuid[] DEFAULT NULL,
  min_employees int DEFAULT NULL,
  max_employees int DEFAULT NULL,
  min_revenue numeric DEFAULT NULL,
  max_revenue numeric DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  sort_direction text DEFAULT 'desc'
)
RETURNS TABLE (
  id uuid,
  company_name text,
  description text,
  employee_count integer,
  annual_revenue numeric,
  website text,
  phone text,
  email text,
  address text,
  categories jsonb,
  relevance float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH prospect_search AS (
    SELECT
      p.*,
      CASE
        WHEN search_term IS NULL THEN 1
        ELSE (
          ts_rank(
            to_tsvector('english', p.company_name || ' ' || COALESCE(p.description, '')),
            to_tsquery('english', regexp_replace(search_term, '\s+', ':* & ', 'g') || ':*')
          )
        )
      END as search_rank
    FROM prospects p
    WHERE
      (search_term IS NULL OR
        to_tsvector('english', p.company_name || ' ' || COALESCE(p.description, '')) @@
        to_tsquery('english', regexp_replace(search_term, '\s+', ':* & ', 'g') || ':*'))
      AND (min_employees IS NULL OR p.employee_count >= min_employees)
      AND (max_employees IS NULL OR p.employee_count <= max_employees)
      AND (min_revenue IS NULL OR p.annual_revenue >= min_revenue)
      AND (max_revenue IS NULL OR p.annual_revenue <= max_revenue)
      AND (category_ids IS NULL OR EXISTS (
        SELECT 1 FROM prospect_categories pc
        WHERE pc.prospect_id = p.id AND pc.category_id = ANY(category_ids)
      ))
  )
  SELECT
    ps.*,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', ic.id,
        'name', ic.name,
        'is_primary', pc.is_primary
      ))
      FROM prospect_categories pc
      JOIN industry_categories ic ON ic.id = pc.category_id
      WHERE pc.prospect_id = ps.id
    ) as categories,
    ps.search_rank as relevance
  FROM prospect_search ps
  ORDER BY
    CASE
      WHEN sort_by = 'relevance' AND sort_direction = 'desc' THEN ps.search_rank END DESC,
    CASE
      WHEN sort_by = 'relevance' AND sort_direction = 'asc' THEN ps.search_rank END ASC,
    CASE
      WHEN sort_by = 'company_name' AND sort_direction = 'desc' THEN ps.company_name END DESC,
    CASE
      WHEN sort_by = 'company_name' AND sort_direction = 'asc' THEN ps.company_name END ASC,
    CASE
      WHEN sort_by = 'employee_count' AND sort_direction = 'desc' THEN ps.employee_count END DESC,
    CASE
      WHEN sort_by = 'employee_count' AND sort_direction = 'asc' THEN ps.employee_count END ASC,
    CASE
      WHEN sort_by = 'annual_revenue' AND sort_direction = 'desc' THEN ps.annual_revenue END DESC,
    CASE
      WHEN sort_by = 'annual_revenue' AND sort_direction = 'asc' THEN ps.annual_revenue END ASC;
END;
$$;
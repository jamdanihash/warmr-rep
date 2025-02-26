/*
  # Update search function

  1. Changes
    - Create an improved search_prospects function with better text search handling
    - Fix parameter naming to match client expectations
    - Add better handling of NULL and empty search terms
    - Improve search ranking calculation
*/

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
DECLARE
  search_query text;
BEGIN
  -- Safely construct the search query
  IF search_term IS NOT NULL AND search_term != '' THEN
    search_query := string_agg(lexeme || ':*', ' & ')
    FROM unnest(regexp_split_to_array(trim(search_term), '\s+')) word,
         to_tsquery('simple', quote_literal(word)) lexeme;
  END IF;

  RETURN QUERY
  WITH prospect_search AS (
    SELECT
      p.*,
      CASE
        WHEN search_term IS NULL OR search_term = '' THEN 1
        ELSE (
          ts_rank(
            to_tsvector('english', p.company_name || ' ' || COALESCE(p.description, '')),
            to_tsquery('english', COALESCE(search_query, ''))
          )
        )
      END as search_rank
    FROM prospects p
    WHERE
      (search_term IS NULL OR search_term = '' OR
        to_tsvector('english', p.company_name || ' ' || COALESCE(p.description, '')) @@
        to_tsquery('english', COALESCE(search_query, '')))
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
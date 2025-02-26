/*
  # Add example lead requests

  1. New Content
    - Add example lead requests to demonstrate the system
    - Include varied industries and requirements
    - Add realistic budget ranges and timelines

  2. Data Structure
    - Uses existing requirements and requirement_categories tables
    - Links to existing industry categories
*/

DO $$
DECLARE
  tech_id uuid;
  healthcare_id uuid;
  finance_id uuid;
  requirement_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO tech_id FROM industry_categories WHERE name = 'Technology';
  SELECT id INTO healthcare_id FROM industry_categories WHERE name = 'Healthcare';
  SELECT id INTO finance_id FROM industry_categories WHERE name = 'Financial Services';

  -- Example 1: CRM Implementation
  INSERT INTO requirements (
    title,
    description,
    budget_min,
    budget_max,
    deadline,
    status,
    created_at
  ) VALUES (
    'Looking for CRM Implementation Partner',
    'Description:
We need help implementing a CRM system that can handle our growing customer base. Looking for a partner who can help us migrate from our current spreadsheet-based system to a modern CRM solution.

Target Customer:
We are a mid-sized marketing agency with 50+ employees, currently managing 200+ client relationships. Our team needs a more efficient way to track client interactions and manage our sales pipeline.',
    25000,
    50000,
    (CURRENT_DATE + INTERVAL '45 days')::timestamp,
    'open',
    (CURRENT_TIMESTAMP - INTERVAL '2 days')
  ) RETURNING id INTO requirement_id;

  INSERT INTO requirement_categories (requirement_id, category_id) VALUES
    (requirement_id, tech_id);

  -- Example 2: Healthcare App Development
  INSERT INTO requirements (
    title,
    description,
    budget_min,
    budget_max,
    deadline,
    status,
    created_at
  ) VALUES (
    'Mobile App for Patient Engagement',
    'Description:
We are seeking a development partner to create a patient engagement mobile app. The app should allow patients to schedule appointments, view test results, and communicate with their healthcare providers securely.

Target Customer:
Regional healthcare network with 5 locations and 50,000+ active patients. We want to improve patient experience and reduce administrative workload.',
    75000,
    120000,
    (CURRENT_DATE + INTERVAL '90 days')::timestamp,
    'open',
    (CURRENT_TIMESTAMP - INTERVAL '1 day')
  ) RETURNING id INTO requirement_id;

  INSERT INTO requirement_categories (requirement_id, category_id) VALUES
    (requirement_id, tech_id),
    (requirement_id, healthcare_id);

  -- Example 3: Financial Software Integration
  INSERT INTO requirements (
    title,
    description,
    budget_min,
    budget_max,
    deadline,
    status,
    created_at
  ) VALUES (
    'Need Expert in Financial Software Integration',
    'Description:
Looking for a technical partner to help integrate our existing financial software with new payment processing systems. Must ensure compliance with financial regulations and maintain high security standards.

Target Customer:
Financial services company processing 10,000+ transactions daily. We need to modernize our payment processing while maintaining compliance with industry regulations.',
    40000,
    80000,
    (CURRENT_DATE + INTERVAL '60 days')::timestamp,
    'open',
    CURRENT_TIMESTAMP
  ) RETURNING id INTO requirement_id;

  INSERT INTO requirement_categories (requirement_id, category_id) VALUES
    (requirement_id, tech_id),
    (requirement_id, finance_id);

END $$;
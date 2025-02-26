/*
  # Insert sample data for prospects management

  1. Data Insertions
    - Industry categories with descriptions
    - Sample prospect companies
    - Category associations for prospects

  2. Categories
    - Technology
    - Healthcare
    - Financial Services
    - Manufacturing
    - Retail
    - Professional Services
    - Real Estate
    - Education
    - Energy
    - Media & Entertainment

  3. Sample Companies
    - 10 diverse companies across different industries
    - Each company has primary and secondary category associations
*/

DO $$
DECLARE
  tech_id uuid;
  healthcare_id uuid;
  finance_id uuid;
  manufacturing_id uuid;
  retail_id uuid;
  professional_id uuid;
  real_estate_id uuid;
  education_id uuid;
  energy_id uuid;
  media_id uuid;
  prospect_id uuid;
BEGIN
  -- Insert industry categories and store their IDs
  INSERT INTO industry_categories (name, description) VALUES
    ('Technology', 'Software, hardware, and IT services')
    RETURNING id INTO tech_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Healthcare', 'Medical services, healthcare technology, and pharmaceuticals')
    RETURNING id INTO healthcare_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Financial Services', 'Banking, insurance, and investment services')
    RETURNING id INTO finance_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Manufacturing', 'Industrial manufacturing and production')
    RETURNING id INTO manufacturing_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Retail', 'Consumer retail and e-commerce')
    RETURNING id INTO retail_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Professional Services', 'Consulting, legal, and business services')
    RETURNING id INTO professional_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Real Estate', 'Commercial and residential real estate')
    RETURNING id INTO real_estate_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Education', 'Educational institutions and services')
    RETURNING id INTO education_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Energy', 'Oil, gas, renewable energy, and utilities')
    RETURNING id INTO energy_id;
  
  INSERT INTO industry_categories (name, description) VALUES
    ('Media & Entertainment', 'Publishing, broadcasting, and digital media')
    RETURNING id INTO media_id;

  -- Insert prospects and their categories
  -- TechCorp Solutions
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('TechCorp Solutions', 'Enterprise software solutions provider', 250, 45000000, 'www.techcorp.com', '+1 (555) 123-4567', 'contact@techcorp.com', 'San Francisco, CA')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, tech_id, true),
    (prospect_id, professional_id, false);

  -- HealthPlus Systems
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('HealthPlus Systems', 'Healthcare technology and services', 500, 75000000, 'www.healthplus.com', '+1 (555) 234-5678', 'info@healthplus.com', 'Boston, MA')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, healthcare_id, true),
    (prospect_id, tech_id, false);

  -- Global Finance Group
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('Global Finance Group', 'Investment and wealth management services', 1000, 150000000, 'www.globalfinance.com', '+1 (555) 345-6789', 'contact@globalfinance.com', 'New York, NY')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, finance_id, true),
    (prospect_id, professional_id, false);

  -- Industrial Manufacturing Co
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('Industrial Manufacturing Co', 'Industrial equipment manufacturing', 750, 95000000, 'www.indmfg.com', '+1 (555) 456-7890', 'sales@indmfg.com', 'Detroit, MI')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, manufacturing_id, true),
    (prospect_id, tech_id, false);

  -- Smart Retail Inc
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('Smart Retail Inc', 'Modern retail solutions and e-commerce', 300, 55000000, 'www.smartretail.com', '+1 (555) 567-8901', 'info@smartretail.com', 'Seattle, WA')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, retail_id, true),
    (prospect_id, tech_id, false);

  -- ConsultPro Services
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('ConsultPro Services', 'Business consulting and strategy', 150, 25000000, 'www.consultpro.com', '+1 (555) 678-9012', 'contact@consultpro.com', 'Chicago, IL')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, professional_id, true),
    (prospect_id, finance_id, false);

  -- Prime Properties
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('Prime Properties', 'Commercial real estate development', 200, 40000000, 'www.primeproperties.com', '+1 (555) 789-0123', 'info@primeproperties.com', 'Miami, FL')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, real_estate_id, true),
    (prospect_id, professional_id, false);

  -- EduTech Innovations
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('EduTech Innovations', 'Educational technology solutions', 100, 15000000, 'www.edutech.com', '+1 (555) 890-1234', 'contact@edutech.com', 'Austin, TX')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, education_id, true),
    (prospect_id, tech_id, false);

  -- Clean Energy Corp
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('Clean Energy Corp', 'Renewable energy solutions', 400, 65000000, 'www.cleanenergy.com', '+1 (555) 901-2345', 'info@cleanenergy.com', 'Denver, CO')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, energy_id, true),
    (prospect_id, manufacturing_id, false);

  -- Digital Media Group
  INSERT INTO prospects (company_name, description, employee_count, annual_revenue, website, phone, email, address)
  VALUES ('Digital Media Group', 'Digital content and marketing', 180, 30000000, 'www.digitalmedia.com', '+1 (555) 012-3456', 'contact@digitalmedia.com', 'Los Angeles, CA')
  RETURNING id INTO prospect_id;
  
  INSERT INTO prospect_categories (prospect_id, category_id, is_primary) VALUES
    (prospect_id, media_id, true),
    (prospect_id, tech_id, false);
END $$;
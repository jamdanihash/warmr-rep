/*
  # Add sample requirements data

  1. New Data
    - Adds sample requirements with realistic data
    - Includes categories and detailed descriptions
    - Demonstrates various budget ranges and deadlines

  2. Structure
    - Each requirement includes:
      - Title and description
      - Budget range
      - Categories
      - Detailed specifications
*/

DO $$
DECLARE
  tech_id uuid;
  healthcare_id uuid;
  finance_id uuid;
  manufacturing_id uuid;
  requirement_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO tech_id FROM industry_categories WHERE name = 'Technology';
  SELECT id INTO healthcare_id FROM industry_categories WHERE name = 'Healthcare';
  SELECT id INTO finance_id FROM industry_categories WHERE name = 'Financial Services';
  SELECT id INTO manufacturing_id FROM industry_categories WHERE name = 'Manufacturing';

  -- Enterprise CRM Integration
  INSERT INTO requirements (
    title,
    description,
    budget_min,
    budget_max,
    deadline,
    status,
    created_at
  ) VALUES (
    'Enterprise CRM Integration Specialist Needed',
    'Description:
We are seeking an experienced integration specialist to help us connect our enterprise CRM system with multiple third-party platforms and internal systems.

Features:
• Real-time data synchronization
• Custom API development
• Automated workflow implementation
• Advanced reporting dashboard
• Multi-platform integration capabilities

Requirements:
MUST HAVE:
• 5+ years experience with Salesforce or similar CRM platforms
• Strong background in API development and integration
• Experience with REST and SOAP protocols
• Proficiency in data migration and ETL processes
• Security compliance expertise (SOC 2, GDPR)

RECOMMENDED:
• Certification in major CRM platforms
• Experience with middleware solutions
• Knowledge of business process automation
• Background in financial services industry
• Experience with legacy system integration

Target Customer:
Enterprise-level financial services company with 5000+ employees looking to modernize our customer relationship management infrastructure.',
    75000,
    150000,
    (CURRENT_DATE + INTERVAL '30 days')::timestamp,
    'open',
    (CURRENT_TIMESTAMP - INTERVAL '2 days')
  ) RETURNING id INTO requirement_id;

  INSERT INTO requirement_categories (requirement_id, category_id) VALUES
    (requirement_id, tech_id),
    (requirement_id, finance_id);

  -- Healthcare Analytics Platform
  INSERT INTO requirements (
    title,
    description,
    budget_min,
    budget_max,
    deadline,
    status,
    created_at
  ) VALUES (
    'Healthcare Analytics Platform Development',
    'Description:
Looking to develop a comprehensive healthcare analytics platform that can process and analyze large volumes of patient data while maintaining HIPAA compliance.

Features:
• Real-time patient data analytics
• Predictive health outcome modeling
• Interactive visualization dashboards
• Secure data storage and transmission
• AI-powered insights generation

Requirements:
MUST HAVE:
• Extensive experience in healthcare software development
• Strong background in data security and HIPAA compliance
• Expertise in machine learning and predictive analytics
• Knowledge of medical data standards (HL7, FHIR)
• Experience with cloud infrastructure (AWS/Azure)

RECOMMENDED:
• Previous work with healthcare providers
• Understanding of clinical workflows
• Experience with electronic health records
• Background in biostatistics
• Certification in healthcare IT systems

Target Customer:
Large regional healthcare provider network seeking to improve patient outcomes through data-driven insights.',
    200000,
    350000,
    (CURRENT_DATE + INTERVAL '45 days')::timestamp,
    'open',
    (CURRENT_TIMESTAMP - INTERVAL '5 days')
  ) RETURNING id INTO requirement_id;

  INSERT INTO requirement_categories (requirement_id, category_id) VALUES
    (requirement_id, tech_id),
    (requirement_id, healthcare_id);

  -- Manufacturing Automation
  INSERT INTO requirements (
    title,
    description,
    budget_min,
    budget_max,
    deadline,
    status,
    created_at
  ) VALUES (
    'Smart Factory Automation System',
    'Description:
Seeking a team to develop and implement a comprehensive smart factory automation system for our manufacturing facility, focusing on Industry 4.0 principles.

Features:
• IoT sensor integration
• Real-time production monitoring
• Predictive maintenance
• Quality control automation
• Resource optimization

Requirements:
MUST HAVE:
• Experience with industrial automation systems
• Expertise in IoT and sensor networks
• Knowledge of PLC programming
• Background in manufacturing processes
• Understanding of SCADA systems

RECOMMENDED:
• Experience with specific manufacturing ERP systems
• Knowledge of industrial safety standards
• Background in lean manufacturing
• Experience with robotics integration
• Understanding of supply chain optimization

Target Customer:
Medium-sized manufacturing company looking to modernize operations and improve efficiency through automation.',
    150000,
    250000,
    (CURRENT_DATE + INTERVAL '60 days')::timestamp,
    'open',
    CURRENT_TIMESTAMP
  ) RETURNING id INTO requirement_id;

  INSERT INTO requirement_categories (requirement_id, category_id) VALUES
    (requirement_id, tech_id),
    (requirement_id, manufacturing_id);

END $$;
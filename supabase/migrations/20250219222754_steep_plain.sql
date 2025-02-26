/*
  # Add sample opportunities

  1. New Data
    - Sample buying and selling opportunities across different industries and locations
    - Realistic business scenarios and descriptions
    - Varied contact information

  2. Changes
    - Insert sample opportunities into the opportunities table
*/

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
      'Digital Ventures Capital',
      'Technology',
      'Looking to acquire SaaS companies with $1-5M ARR in the B2B space. Interested in marketing automation, data analytics, or developer tools.',
      'acquisitions@dvc.com',
      '(415) 555-0123',
      'San Francisco',
      user_id
    ),
    (
      'buying',
      'MedTech Solutions',
      'Healthcare',
      'Seeking to acquire healthcare technology startups specializing in patient engagement platforms or telemedicine solutions. $2-8M revenue range.',
      'growth@medtechsolutions.com',
      '(617) 555-0124',
      'Boston',
      user_id
    ),
    (
      'buying',
      'Green Energy Partners',
      'Energy',
      'Actively seeking renewable energy projects and companies. Particularly interested in solar and wind energy installations with proven track record.',
      'deals@greenenergypartners.com',
      '(303) 555-0125',
      'Denver',
      user_id
    ),
    (
      'buying',
      'Global Manufacturing Group',
      'Manufacturing',
      'Looking to acquire precision manufacturing facilities. Focus on aerospace and automotive components. $5-20M revenue range.',
      'acquisitions@gmg.com',
      '(313) 555-0126',
      'Detroit',
      user_id
    ),
    (
      'buying',
      'Retail Innovation Fund',
      'Retail',
      'Seeking e-commerce businesses with strong brand presence. Interest in fashion, home goods, or specialty products. $1-10M revenue.',
      'investments@retailfund.com',
      '(212) 555-0127',
      'New York',
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
      'CloudTech Solutions',
      'Technology',
      'Cloud infrastructure monitoring platform for sale. 200+ enterprise customers, $3M ARR, 40% YoY growth. Profitable with strong team.',
      'sale@cloudtechsolutions.com',
      '(206) 555-0128',
      'Seattle',
      user_id
    ),
    (
      'selling',
      'HealthCare Analytics Pro',
      'Healthcare',
      'Healthcare data analytics platform for sale. HIPAA compliant, serving 50+ hospitals. $2.5M annual revenue with high margins.',
      'exit@healthcareanalytics.com',
      '(312) 555-0129',
      'Chicago',
      user_id
    ),
    (
      'selling',
      'EduTech Innovations',
      'Education',
      'Leading online learning platform for sale. 100,000+ active users, $1.8M revenue. Complete tech stack and content library included.',
      'sale@edutechinnovations.com',
      '(512) 555-0130',
      'Austin',
      user_id
    ),
    (
      'selling',
      'Precision Manufacturing Co',
      'Manufacturing',
      'CNC manufacturing facility for sale. Specialized in aerospace components. ISO 9001 certified, $4M revenue, established contracts.',
      'sale@precisionmfg.com',
      '(216) 555-0131',
      'Cleveland',
      user_id
    ),
    (
      'selling',
      'FinTech Solutions Ltd',
      'Financial Services',
      'Payment processing platform for sale. Processing $100M+ annually, 1000+ merchants. Compliant with PCI-DSS and major regulations.',
      'exit@fintechsolutions.com',
      '(415) 555-0132',
      'San Francisco',
      user_id
    );
END $$;
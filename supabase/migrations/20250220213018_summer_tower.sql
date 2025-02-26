/*
  # Add Example Opportunities

  1. New Data
    - Adds 20 diverse opportunities across different industries and locations
    - Mix of buying and selling opportunities
    - Realistic business scenarios and contact information

  2. Structure
    - Each opportunity includes:
      - Business name
      - Industry
      - Description
      - Contact information
      - Location
*/

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get a sample user ID
  SELECT id INTO user_id FROM auth.users LIMIT 1;

  -- Insert buying opportunities
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
      'AI Ventures Capital',
      'Technology',
      'Looking to acquire AI/ML startups with proven technology in natural language processing or computer vision. Revenue range $2-8M.',
      'acquisitions@aiventures.com',
      '(415) 555-0101',
      'San Francisco',
      user_id
    ),
    (
      'buying',
      'BioTech Growth Partners',
      'Healthcare',
      'Seeking biotech companies specializing in personalized medicine or genomics. Target companies with validated research and initial market traction.',
      'deals@biotechgrowth.com',
      '(617) 555-0102',
      'Boston',
      user_id
    ),
    (
      'buying',
      'Sustainable Energy Fund',
      'Energy',
      'Looking to invest in renewable energy projects. Particularly interested in solar farms and wind energy installations with existing contracts.',
      'invest@sustainablefund.com',
      '(303) 555-0103',
      'Denver',
      user_id
    ),
    (
      'buying',
      'E-Commerce Accelerator',
      'Retail',
      'Acquiring D2C brands with minimum $1M annual revenue. Strong preference for brands with unique products and loyal customer base.',
      'growth@ecommaccel.com',
      '(206) 555-0104',
      'Seattle',
      user_id
    ),
    (
      'buying',
      'FinTech Acquisitions Group',
      'Financial Services',
      'Seeking fintech startups with innovative payment solutions or lending platforms. Revenue range $3-15M with established customer base.',
      'ma@fintechgroup.com',
      '(212) 555-0105',
      'New York',
      user_id
    ),
    (
      'buying',
      'Industrial Tech Partners',
      'Manufacturing',
      'Looking to acquire industrial automation companies. Interested in robotics, IoT solutions, or smart factory technology providers.',
      'deals@indtech.com',
      '(312) 555-0106',
      'Chicago',
      user_id
    ),
    (
      'buying',
      'EdTech Ventures',
      'Education',
      'Seeking educational technology companies with proven products in K-12 or higher education markets. Revenue $1-5M preferred.',
      'acquire@edtechventures.com',
      '(512) 555-0107',
      'Austin',
      user_id
    ),
    (
      'buying',
      'Digital Media Group',
      'Media & Entertainment',
      'Looking to acquire digital content creators and streaming platforms. Focus on niche markets with dedicated audience.',
      'buyouts@digitalmedia.com',
      '(310) 555-0108',
      'Los Angeles',
      user_id
    ),
    (
      'buying',
      'Smart Property Ventures',
      'Real Estate',
      'Acquiring proptech companies with solutions for property management or real estate transactions. Revenue $2-10M.',
      'deals@smartproperty.com',
      '(305) 555-0109',
      'Miami',
      user_id
    ),
    (
      'buying',
      'Cloud Services Capital',
      'Technology',
      'Interested in acquiring cloud infrastructure and SaaS companies. Looking for B2B solutions with strong recurring revenue.',
      'invest@cloudcapital.com',
      '(650) 555-0110',
      'San Jose',
      user_id
    );

  -- Insert selling opportunities
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
      'DataSense Analytics',
      'Technology',
      'Enterprise data analytics platform for sale. 150+ corporate clients, $4M ARR, 45% growth rate. Complete tech stack and team available.',
      'exit@datasense.com',
      '(415) 555-0111',
      'San Francisco',
      user_id
    ),
    (
      'selling',
      'MedTech Solutions',
      'Healthcare',
      'Patient engagement platform for sale. HIPAA compliant, serving 75+ healthcare providers. $2.8M annual revenue with high margins.',
      'sale@medtechsolutions.com',
      '(617) 555-0112',
      'Boston',
      user_id
    ),
    (
      'selling',
      'GreenEnergy Systems',
      'Energy',
      'Renewable energy installation company for sale. Specialized in commercial solar. $5M revenue, strong project pipeline.',
      'sell@greenenergy.com',
      '(303) 555-0113',
      'Denver',
      user_id
    ),
    (
      'selling',
      'Fashion Forward',
      'Retail',
      'D2C fashion brand for sale. $2.5M revenue, 100k+ social followers. Complete inventory and e-commerce infrastructure included.',
      'exit@fashionforward.com',
      '(206) 555-0114',
      'Seattle',
      user_id
    ),
    (
      'selling',
      'SecurePay Solutions',
      'Financial Services',
      'Payment processing platform for sale. PCI compliant, processing $200M annually. Strong partnerships with major banks.',
      'sale@securepay.com',
      '(212) 555-0115',
      'New York',
      user_id
    ),
    (
      'selling',
      'Smart Factory Tech',
      'Manufacturing',
      'Industrial IoT platform for sale. Monitoring 1000+ devices across 50 facilities. $3.2M recurring revenue.',
      'exit@smartfactory.com',
      '(312) 555-0116',
      'Chicago',
      user_id
    ),
    (
      'selling',
      'EduLearn Platform',
      'Education',
      'Online learning management system for sale. 200k+ active users, serving K-12 schools. $1.5M annual revenue.',
      'sell@edulearn.com',
      '(512) 555-0117',
      'Austin',
      user_id
    ),
    (
      'selling',
      'StreamMedia Pro',
      'Media & Entertainment',
      'Streaming content platform for sale. 500k+ subscribers, original content library. $4.5M revenue with growing ad revenue.',
      'exit@streammedia.com',
      '(310) 555-0118',
      'Los Angeles',
      user_id
    ),
    (
      'selling',
      'PropTech Solutions',
      'Real Estate',
      'Property management software for sale. Serving 1000+ properties, $2.2M ARR. Mobile apps and complete backend included.',
      'sell@proptech.com',
      '(305) 555-0119',
      'Miami',
      user_id
    ),
    (
      'selling',
      'CloudStack Services',
      'Technology',
      'Cloud infrastructure monitoring tool for sale. 300+ enterprise customers, $5.5M ARR. Profitable with strong team.',
      'exit@cloudstack.com',
      '(650) 555-0120',
      'San Jose',
      user_id
    );
END $$;
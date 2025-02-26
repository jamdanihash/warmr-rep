export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'SGD', name: 'Singapore Dollar' }
] as const;

export const COUNTRIES = {
  'United States': [
    'New York',
    'San Francisco',
    'Los Angeles',
    'Chicago',
    'Boston',
    'Seattle',
    'Austin',
    'Miami',
    'Denver',
    'Washington DC'
  ],
  'United Kingdom': [
    'London',
    'Manchester',
    'Birmingham',
    'Edinburgh',
    'Glasgow',
    'Leeds'
  ],
  'Germany': [
    'Berlin',
    'Munich',
    'Hamburg',
    'Frankfurt',
    'Cologne',
    'Stuttgart'
  ],
  'France': [
    'Paris',
    'Lyon',
    'Marseille',
    'Toulouse',
    'Bordeaux',
    'Lille'
  ],
  'Japan': [
    'Tokyo',
    'Osaka',
    'Yokohama',
    'Nagoya',
    'Fukuoka',
    'Sapporo'
  ],
  'Australia': [
    'Sydney',
    'Melbourne',
    'Brisbane',
    'Perth',
    'Adelaide',
    'Gold Coast'
  ],
  'Canada': [
    'Toronto',
    'Vancouver',
    'Montreal',
    'Calgary',
    'Ottawa',
    'Edmonton'
  ],
  'Singapore': [
    'Singapore'
  ],
  'India': [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Pune'
  ],
  'China': [
    'Shanghai',
    'Beijing',
    'Shenzhen',
    'Guangzhou',
    'Hangzhou',
    'Chengdu'
  ]
} as const;
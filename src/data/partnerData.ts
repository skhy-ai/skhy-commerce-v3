export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Sensors',
  'Communication Equipment',
  'Software',
  'Hardware',
  'AI/ML Services',
  'Consulting',
  'Training',
  'Support Services'
] as const;

export const PRODUCT_TYPES = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'service', label: 'Service' }
] as const;

export const PRICING_MODELS = [
  { value: 'flat', label: 'Flat Rate' },
  { value: 'package', label: 'Package Pricing' },
  { value: 'tiered', label: 'Tiered Pricing' },
  { value: 'usage', label: 'Usage-Based' }
] as const;

export const SELLER_TYPES = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'distributor', label: 'Distributor' }
] as const;

export const COUNTRY_OPTIONS = [
  // North America
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'U.S. Virgin Islands' },

  // Asia-Pacific
  { value: 'MY', label: 'Malaysia' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'TH', label: 'Thailand' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'TW', label: 'Taiwan' },

  // Europe
  { value: 'UA', label: 'Ukraine' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'HU', label: 'Hungary' },
  { value: 'RO', label: 'Romania' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GR', label: 'Greece' },
  { value: 'IE', label: 'Ireland' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'MT', label: 'Malta' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'EE', label: 'Estonia' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'HR', label: 'Croatia' },
  { value: 'IS', label: 'Iceland' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'AL', label: 'Albania' },
  { value: 'BA', label: 'Bosnia & Herzegovina' },
  { value: 'RS', label: 'Serbia' },
  { value: 'TR', label: 'Turkey' },

  // Middle East & Others
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'IL', label: 'Israel' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'KY', label: 'Cayman Islands' },
  { value: 'VG', label: 'British Virgin Islands' }
] as const;

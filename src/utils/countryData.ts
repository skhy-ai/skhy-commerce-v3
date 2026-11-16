/**
 * Utility for handling country-related data such as flags and names.
 */

const countryNames: Record<string, string> = {
  'IN': 'India',
  'MY': 'Malaysia',
  'CN': 'China',
  'US': 'USA',
  'SG': 'Singapore',
  'GB': 'UK',
  'DE': 'Germany',
  'FR': 'France',
  'JP': 'Japan',
  'UA': 'Ukraine',
  'AE': 'UAE',
  'AU': 'Australia',
  'CA': 'Canada',
  'CH': 'Switzerland',
  'HK': 'Hong Kong',
};

/**
 * Returns the FlagCDN image URL for a given country code.
 */
export const getFlagImgUrl = (countryCode: string, size: 'w20' | 'w40' | 'w80' = 'w40'): string => {
  if (!countryCode || countryCode.length !== 2) return '';
  return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`;
};

/**
 * Converts an ISO 3166-1 alpha-2 country code to a flag emoji.
 */
export const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
    
  return String.fromCodePoint(...codePoints);
};

/**
 * Returns the full name for a given country code.
 */
export const getCountryName = (countryCode: string): string => {
  if (!countryCode) return 'Unknown Origin';
  const code = countryCode.toUpperCase();
  return countryNames[code] || code;
};

/**
 * Returns a list of supported country objects for filters.
 */
export const getAllCountries = (existingCodes: string[] = []) => {
  if (existingCodes.length === 0) {
    return Object.entries(countryNames).map(([code, name]) => ({ code, name }));
  }
  
  return existingCodes
    .map(code => ({
      code: code.toUpperCase(),
      name: getCountryName(code)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

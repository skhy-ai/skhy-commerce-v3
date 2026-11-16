export type CurrencyPreference = {
  countryCode: string | null;
  currency: 'INR' | 'USD';
};

import { safeStorage } from './storage';

const BLOCKED_COUNTRIES = ['PK', 'BD', 'NP', 'MM', 'AF'];

const FALLBACK_API = 'https://api.country.is';

export async function detectUserCountry(): Promise<string | null> {
  // Check cache first to avoid 429 errors
  const cached = safeStorage.local.getItem('skhy_user_country');
  if (cached) return cached;

  try {
    // Primary: ipapi.co (via proxy)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    // Use local proxy path to avoid CORS and potential browser-side blocking
    const response = await fetch('/api/geoip', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as { country_code?: string };
      const code = data.country_code ? String(data.country_code).toUpperCase() : null;
      if (code) safeStorage.local.setItem('skhy_user_country', code);
      return code;
    }

    // Fallback if primary fails (429, etc)
    throw new Error('Primary GeoIP failed');

  } catch (error) {
    // Try Fallback: api.country.is
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(FALLBACK_API, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as { country: string };
        return data.country ? String(data.country).toUpperCase() : null;
      }
    } catch (fallbackError) {
      // Silent fail if both fail
      return null;
    }
    return null;
  }
}

export function isCountryBlocked(countryCode: string | null): boolean {
  if (!countryCode) return false;
  try {
    const cached = safeStorage.local.getItem('skhy_blocked_countries');
    const blockedList = cached ? JSON.parse(cached) : BLOCKED_COUNTRIES;
    return blockedList.includes(String(countryCode).toUpperCase());
  } catch (e) {
    return BLOCKED_COUNTRIES.includes(String(countryCode).toUpperCase());
  }
}

export function currencyForCountry(countryCode: string | null): CurrencyPreference {
  const cc = countryCode ? String(countryCode).toUpperCase() : null;
  
  let defaultCurr = 'USD';
  try {
    const cached = safeStorage.local.getItem('skhy_currency_config');
    if (cached) {
      const config = JSON.parse(cached);
      defaultCurr = config.defaultCurrency || 'USD';
    }
  } catch (e) {
    // fallback
  }

  if (cc === 'IN') return { countryCode: cc, currency: 'INR' };
  return { countryCode: cc, currency: defaultCurr as 'INR' | 'USD' };
}

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

// Baseline rates relative to USD (approximate, for display)
const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 84.5, // 1 USD = 84.5 INR
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 151.5
};

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

export function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = CURRENCY_RATES[from as CurrencyCode] || 1;
  const toRate = CURRENCY_RATES[to as CurrencyCode] || 1;

  // Convert to USD first, then to target
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}


import { safeStorage } from './storage';

export interface VisitorIntent {
  category: 'solutions' | 'jobs' | 'partnership' | 'build_drone' | null;
  subCategory?: 'defense' | 'industry' | null;
  email?: string;
  timestamp: number;
}

const COOKIE_NAME = 'skhy_visitor_intent';

export function setVisitorIntentCookie(intent: Omit<VisitorIntent, 'timestamp'>): VisitorIntent {
  const fullIntent: VisitorIntent = {
    ...intent,
    timestamp: Date.now()
  };

  const jsonVal = JSON.stringify(fullIntent);

  // Set cookie with 30 days expiration
  try {
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(jsonVal)}${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to set cookie:', e);
  }

  // Also mirror in safeStorage local
  safeStorage.local.setItem(COOKIE_NAME, jsonVal);

  // Notify listeners via custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skhy_intent_changed', { detail: fullIntent }));
  }

  return fullIntent;
}

export function getVisitorIntentCookie(): VisitorIntent | null {
  // 1. Try reading cookie
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const [name, val] = c.trim().split('=');
        if (name === COOKIE_NAME && val) {
          const parsed = JSON.parse(decodeURIComponent(val));
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to read visitor cookie:', e);
  }

  // 2. Fallback to safeStorage local
  const localVal = safeStorage.local.getItem(COOKIE_NAME);
  if (localVal) {
    try {
      return JSON.parse(localVal);
    } catch (e) {
      console.warn('Failed to parse stored local intent:', e);
    }
  }

  return null;
}

export function hasVisitorCompletedWizard(): boolean {
  const intent = getVisitorIntentCookie();
  return intent !== null && intent.category !== null;
}

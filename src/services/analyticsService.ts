// src/services/analyticsService.ts
import { supabase } from '../lib/supabase';
import { safeStorage } from '../utils/storage';
import { getVisitorIntentCookie } from '../utils/cookie';

export interface TelemetryEventPayload {
  eventType: 'section_view' | 'market_search' | 'product_view' | 'page_visit' | 'cta_click' | 'whitepaper_download';
  sectionName?: string;
  searchTerm?: string;
  categoryFilter?: string;
  dwellTimeMs?: number;
  metadata?: Record<string, any>;
}

export interface StoredTelemetryEvent extends TelemetryEventPayload {
  id: string;
  visitorIntent?: string;
  visitorSubCategory?: string;
  visitorEmail?: string;
  timestamp: string;
}

const LOCAL_ANALYTICS_KEY = 'skhy_visitor_analytics_events';

export function trackEvent(payload: TelemetryEventPayload): void {
  const intent = getVisitorIntentCookie();
  const timestamp = new Date().toISOString();
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const eventRecord: StoredTelemetryEvent = {
    id: eventId,
    ...payload,
    visitorIntent: intent?.category || 'general',
    visitorSubCategory: intent?.subCategory || undefined,
    visitorEmail: intent?.email || undefined,
    timestamp
  };

  // 1. Dispatch to Google Analytics (window.gtag) if initialized
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', payload.eventType, {
        event_category: intent?.category || 'general',
        event_label: payload.sectionName || payload.searchTerm || payload.categoryFilter || 'interaction',
        section_name: payload.sectionName,
        search_term: payload.searchTerm,
        category_filter: payload.categoryFilter,
        ...payload.metadata
      });
    } catch { /* silent */ }
  }

  // 2. Store in local storage queue (capped at 200 events)
  try {
    const raw = safeStorage.local.getItem(LOCAL_ANALYTICS_KEY);
    const events: StoredTelemetryEvent[] = raw ? JSON.parse(raw) : [];
    events.unshift(eventRecord);
    if (events.length > 200) events.pop();
    safeStorage.local.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('[Analytics] Error saving local event:', e);
  }

  // 3. Stream to Supabase (visitor_telemetry table)
  supabase
    .from('visitor_telemetry')
    .insert([{
      event_type: payload.eventType,
      section_name: payload.sectionName || null,
      search_term: payload.searchTerm || null,
      category_filter: payload.categoryFilter || null,
      dwell_time_ms: payload.dwellTimeMs || 0,
      visitor_intent: intent?.category || 'general',
      visitor_email: intent?.email || null,
      metadata: payload.metadata || {},
      created_at: timestamp
    }])
    .then(() => {})
    .catch(() => {});
}

export function getTelemetryEvents(): StoredTelemetryEvent[] {
  try {
    const raw = safeStorage.local.getItem(LOCAL_ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

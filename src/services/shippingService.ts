// src/services/shippingService.ts
import { supabase } from '../lib/supabase';
import {
  DeliveryPartnersConfig,
  DEFAULT_DELIVERY_CONFIG,
  ShippingCalculationParams,
  ShippingQuote,
  calculateAllCarrierRates,
} from '../utils/deliveryCalculators';

/**
 * Fetch active Delivery Partners Configuration from Supabase system_config
 */
export async function getDeliveryPartnersConfig(): Promise<DeliveryPartnersConfig> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'delivery_partners_config')
      .maybeSingle();

    if (error || !data || !data.value) {
      return DEFAULT_DELIVERY_CONFIG;
    }

    return {
      dhl: { ...DEFAULT_DELIVERY_CONFIG.dhl, ...(data.value.dhl || {}) },
      ups: { ...DEFAULT_DELIVERY_CONFIG.ups, ...(data.value.ups || {}) },
      parcelhub: { ...DEFAULT_DELIVERY_CONFIG.parcelhub, ...(data.value.parcelhub || {}) },
    };
  } catch (err) {
    console.warn('Could not load delivery partners config, using defaults:', err);
    return DEFAULT_DELIVERY_CONFIG;
  }
}

/**
 * Save updated Delivery Partners Configuration to Supabase system_config (Admin only)
 */
export async function saveDeliveryPartnersConfig(config: DeliveryPartnersConfig): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: 'delivery_partners_config',
        value: config,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.error('Failed to save delivery partners config:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving delivery partners config:', err);
    return false;
  }
}

/**
 * Calculate available shipping quotes for the customer checkout
 */
export async function fetchCheckoutShippingRates(params: ShippingCalculationParams): Promise<ShippingQuote[]> {
  const config = await getDeliveryPartnersConfig();
  return calculateAllCarrierRates(params, config);
}

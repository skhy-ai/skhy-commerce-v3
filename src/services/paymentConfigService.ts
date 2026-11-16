// src/services/paymentConfigService.ts
import { supabase } from '../lib/supabase';
import { AllPaymentGatewaysConfig, DEFAULT_PAYMENT_GATEWAYS } from '../types/payment';

const CONFIG_KEY = 'payment_gateways_config';

/**
 * Fetch All Payment Gateways Configuration
 */
export async function getPaymentGatewaysConfig(): Promise<AllPaymentGatewaysConfig> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .maybeSingle();

    if (error || !data || !data.value) {
      return DEFAULT_PAYMENT_GATEWAYS;
    }

    return {
      stripe: { ...DEFAULT_PAYMENT_GATEWAYS.stripe, ...(data.value.stripe || {}) },
      paypal: { ...DEFAULT_PAYMENT_GATEWAYS.paypal, ...(data.value.paypal || {}) },
      crypto: { ...DEFAULT_PAYMENT_GATEWAYS.crypto, ...(data.value.crypto || {}) },
      bankWire: { ...DEFAULT_PAYMENT_GATEWAYS.bankWire, ...(data.value.bankWire || {}) },
    };
  } catch (err) {
    console.warn('Could not load payment gateways config, using defaults:', err);
    return DEFAULT_PAYMENT_GATEWAYS;
  }
}

/**
 * Save Payment Gateways Configuration (Admin only)
 */
export async function savePaymentGatewaysConfig(config: AllPaymentGatewaysConfig): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: CONFIG_KEY,
        value: config,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.error('Failed to save payment gateways config:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving payment gateways config:', err);
    return false;
  }
}

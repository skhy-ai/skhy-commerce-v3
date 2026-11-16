// src/utils/deliveryCalculators.ts
import { calculateDHLShippingMYR, getDHLZone } from './dhlCalculator';

export interface ShippingCalculationParams {
  destinationCountryCode: string;
  actualWeightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface ShippingQuote {
  id: string;
  carrier: 'dhl' | 'ups' | 'parcelhub';
  carrierName: string;
  serviceName: string;
  rateUSD: number;
  rateOriginal: number;
  currency: string;
  estimatedDays: string;
  trackingIncluded: boolean;
  description: string;
}

export interface DeliveryPartnersConfig {
  dhl: {
    enabled: boolean;
    apiKey?: string;
    accountNumber?: string;
    mode: 'sandbox' | 'live';
    handlingFeeUSD: number;
  };
  ups: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
    accountNumber?: string;
    mode: 'sandbox' | 'live';
    handlingFeeUSD: number;
  };
  parcelhub: {
    enabled: boolean;
    apiToken?: string;
    merchantId?: string;
    mode: 'sandbox' | 'live';
    handlingFeeUSD: number;
  };
}

export const DEFAULT_DELIVERY_CONFIG: DeliveryPartnersConfig = {
  dhl: {
    enabled: true,
    mode: 'live',
    handlingFeeUSD: 5,
  },
  ups: {
    enabled: true,
    mode: 'live',
    handlingFeeUSD: 5,
  },
  parcelhub: {
    enabled: true,
    mode: 'live',
    handlingFeeUSD: 3,
  },
};

/**
 * Approximate conversion from MYR to USD for DHL baseline rates
 */
const MYR_TO_USD_RATE = 0.22;

/**
 * UPS Rate calculation (Zone-based bracket with international multipliers)
 */
export const calculateUPSShippingUSD = (params: ShippingCalculationParams): { ground: number; express: number } => {
  const weight = Math.max(params.actualWeightKg, 0.5);
  const code = (params.destinationCountryCode || 'US').toUpperCase();

  let baseRate = 22.0; // standard base
  let perKgRate = 8.5;

  // Regional adjustments
  if (['US', 'CA', 'MX'].includes(code)) {
    baseRate = 18.0;
    perKgRate = 6.0;
  } else if (['GB', 'DE', 'FR', 'NL', 'IT', 'ES'].includes(code)) {
    baseRate = 25.0;
    perKgRate = 9.0;
  } else if (['SG', 'MY', 'JP', 'KR', 'AU', 'IN'].includes(code)) {
    baseRate = 20.0;
    perKgRate = 7.5;
  } else {
    baseRate = 32.0;
    perKgRate = 12.0;
  }

  const ground = Math.round((baseRate + (weight - 0.5) * perKgRate) * 100) / 100;
  const express = Math.round((ground * 1.45) * 100) / 100;

  return { ground, express };
};

/**
 * ParcelHub Rate calculation (Optimized for express parcels & regional freight)
 */
export const calculateParcelHubShippingUSD = (params: ShippingCalculationParams): number => {
  const weight = Math.max(params.actualWeightKg, 0.5);
  const code = (params.destinationCountryCode || 'MY').toUpperCase();

  let baseRate = 15.0;
  let perKgRate = 5.5;

  if (['MY', 'SG', 'TH', 'ID', 'PH', 'VN'].includes(code)) {
    baseRate = 9.0;
    perKgRate = 3.5;
  } else if (['IN', 'TW', 'HK'].includes(code)) {
    baseRate = 16.0;
    perKgRate = 5.0;
  } else {
    baseRate = 28.0;
    perKgRate = 8.0;
  }

  return Math.round((baseRate + (weight - 0.5) * perKgRate) * 100) / 100;
};

/**
 * Unified calculation for active carriers based on Admin configuration
 */
export const calculateAllCarrierRates = (
  params: ShippingCalculationParams,
  config: DeliveryPartnersConfig = DEFAULT_DELIVERY_CONFIG
): ShippingQuote[] => {
  const quotes: ShippingQuote[] = [];

  // 1. DHL Express
  if (config.dhl.enabled) {
    const dhlMYR = calculateDHLShippingMYR({
      destinationCountryCode: params.destinationCountryCode,
      actualWeightKg: params.actualWeightKg,
      lengthCm: params.lengthCm,
      widthCm: params.widthCm,
      heightCm: params.heightCm,
    });

    const rateUSD = dhlMYR 
      ? Math.round((dhlMYR * MYR_TO_USD_RATE + config.dhl.handlingFeeUSD) * 100) / 100
      : Math.round((35.0 + params.actualWeightKg * 9.5 + config.dhl.handlingFeeUSD) * 100) / 100;

    quotes.push({
      id: 'rate_dhl_express',
      carrier: 'dhl',
      carrierName: 'DHL Express',
      serviceName: 'DHL Express Worldwide',
      rateUSD,
      rateOriginal: dhlMYR || (rateUSD / MYR_TO_USD_RATE),
      currency: 'USD',
      estimatedDays: '2 - 4 Business Days',
      trackingIncluded: true,
      description: 'Global priority air freight with end-to-end tracking & customs clearance assistance.',
    });
  }

  // 2. UPS
  if (config.ups.enabled) {
    const upsRates = calculateUPSShippingUSD(params);

    quotes.push({
      id: 'rate_ups_saver',
      carrier: 'ups',
      carrierName: 'UPS',
      serviceName: 'UPS Worldwide Saver',
      rateUSD: Math.round((upsRates.ground + config.ups.handlingFeeUSD) * 100) / 100,
      rateOriginal: Math.round((upsRates.ground + config.ups.handlingFeeUSD) * 100) / 100,
      currency: 'USD',
      estimatedDays: '3 - 5 Business Days',
      trackingIncluded: true,
      description: 'Guaranteed delivery by end of day with full GPS tracking.',
    });

    quotes.push({
      id: 'rate_ups_expedited',
      carrier: 'ups',
      carrierName: 'UPS',
      serviceName: 'UPS Worldwide Expedited',
      rateUSD: Math.round((upsRates.express + config.ups.handlingFeeUSD) * 100) / 100,
      rateOriginal: Math.round((upsRates.express + config.ups.handlingFeeUSD) * 100) / 100,
      currency: 'USD',
      estimatedDays: '1 - 3 Business Days',
      trackingIncluded: true,
      description: 'Fastest door-to-door transit for urgent autonomous modules.',
    });
  }

  // 3. ParcelHub
  if (config.parcelhub.enabled) {
    const parcelHubUSD = calculateParcelHubShippingUSD(params);
    const finalRate = Math.round((parcelHubUSD + config.parcelhub.handlingFeeUSD) * 100) / 100;

    quotes.push({
      id: 'rate_parcelhub_standard',
      carrier: 'parcelhub',
      carrierName: 'ParcelHub Logistics',
      serviceName: 'ParcelHub Cross-Border Express',
      rateUSD: finalRate,
      rateOriginal: finalRate,
      currency: 'USD',
      estimatedDays: '4 - 7 Business Days',
      trackingIncluded: true,
      description: 'Cost-effective consolidated freight courier for regional hardware shipments.',
    });
  }

  return quotes;
};

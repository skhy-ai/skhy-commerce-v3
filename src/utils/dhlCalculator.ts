import {
  dhlExportZones,
  documentsUpTo2Kg,
  nonDocumentsRates,
  multiplierRatesOver30Kg
} from '../data/dhl/dhlRates';

/**
 * Interface for calculation parameters
 */
export interface DHLShippingParams {
  destinationCountryCode: string; // ISO Alpha-2 code
  actualWeightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  isDocument?: boolean;
}

export const getDHLZone = (destinationCountryCode: string): number => {
  return dhlExportZones[destinationCountryCode.toUpperCase()] || 8;
};

/**
 * DHL uses a volumetric divisor of 5000 for standard express
 */
const VOLUMETRIC_DIVISOR = 5000;

/**
 * Fuel surcharge percentage. Set to 0% for base rate representation, 
 * but can be adjusted later via admin config.
 */
const FUEL_SURCHARGE_PERCENT = 0; 

/**
 * Calculates DHL Express Worldwide Export shipping rate in MYR
 * @param params Parameters for the shipment
 * @returns Rate in MYR, or null if calculation is not possible (e.g. unknown zone/weight)
 */
export const calculateDHLShippingMYR = (params: DHLShippingParams): number | null => {
  const {
    destinationCountryCode,
    actualWeightKg,
    lengthCm = 10,
    widthCm = 10,
    heightCm = 10,
    isDocument = false
  } = params;

  // 1. Determine Zone
  // Default to Zone 8 if country not mapped in our parsing
  const zone = dhlExportZones[destinationCountryCode.toUpperCase()] || 8;
  const zoneIndex = zone - 1; // 0-indexed for arrays

  // 2. Determine chargeable weight
  const volumetricWeight = (lengthCm * widthCm * heightCm) / VOLUMETRIC_DIVISOR;
  const rawChargeableWeight = Math.max(actualWeightKg, volumetricWeight);

  // Round up to nearest 0.5kg for weights up to 30kg
  // For weights over 30kg, round up to nearest 1kg
  let chargeableWeight: number;
  if (rawChargeableWeight <= 30) {
    chargeableWeight = Math.ceil(rawChargeableWeight * 2) / 2;
  } else {
    chargeableWeight = Math.ceil(rawChargeableWeight);
  }

  // 3. Lookup Base Rate
  let baseRateMYR = 0;

  if (chargeableWeight <= 30) {
    let rateRow: number[] | undefined;

    if (isDocument && chargeableWeight <= 2.0) {
      rateRow = documentsUpTo2Kg.find(row => row[0] === chargeableWeight);
    } else {
      rateRow = nonDocumentsRates.find(row => row[0] === chargeableWeight);
    }

    if (!rateRow) return null; // Should not happen with valid weights

    baseRateMYR = rateRow[zoneIndex + 1]; // +1 because index 0 is weight
  } else {
    // Multiplier calculation
    let multiplier = 0;
    if (chargeableWeight <= 70) {
      multiplier = multiplierRatesOver30Kg.upTo70kg[zoneIndex];
    } else if (chargeableWeight <= 300) {
      multiplier = multiplierRatesOver30Kg.upTo300kg[zoneIndex];
    } else {
      multiplier = multiplierRatesOver30Kg.over300kg[zoneIndex];
    }

    baseRateMYR = chargeableWeight * multiplier;
  }

  // 4. Apply Surcharges
  const totalRate = baseRateMYR * (1 + (FUEL_SURCHARGE_PERCENT / 100));

  return totalRate;
};

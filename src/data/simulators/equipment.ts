/**
 * Specialized equipment shared across simulators.
 */

export interface Equipment {
    id: string | number;
    name: string;
    weight_kg: number;
    price: number;
    description: string;
    category: 'navigation' | 'mission' | 'control';
    power_draw_w?: number;
    voltage_v?: number;
    segment?: 'air' | 'gcs' | 'rover';
}

export const AJ_GPS_SYSTEM: Equipment = {
    id: '900015',
    name: 'AJGPS 602 (9-Channel CRPA)',
    weight_kg: 0.890,
    price: 5914,
    description: 'Controlled Reception Pattern Antenna (CRPA) for GPS-denied environments.',
    category: 'navigation',
    power_draw_w: 12,
    voltage_v: 5,
    segment: 'air'
};

export const ROVER_CORE_SYSTEM: Equipment = {
    id: '900009',
    name: 'SKHY Jamming Resilient Core',
    weight_kg: 1.150,
    price: 3500,
    description: 'Ampere+FPGA edge processing unit for autonomous rover operations.',
    category: 'mission',
    power_draw_w: 25,
    voltage_v: 12,
    segment: 'rover'
};

export const HIGH_GAIN_TELEMETRY: Equipment = {
    id: 900033,
    name: 'ACASOM 20W GaN Telemetry',
    weight_kg: 0.120,
    price: 850,
    description: 'High-power telemetry module with GaN efficiency.',
    category: 'control',
    power_draw_w: 35,
    voltage_v: 12,
    segment: 'air'
};

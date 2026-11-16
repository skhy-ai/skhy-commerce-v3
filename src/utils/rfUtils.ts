/**
 * RF propagation math utilities and default frequency band data.
 * Extracted from RobustTransmissionSimulator.tsx for modularity and reuse.
 */

export interface RFBand {
    id: number;
    name: string;
    freq: number;
    gain: number;
    power: number;
    linkDir: 'uplink' | 'downlink';
}

/** Convert watts to dBm */
export const wattsToDbm = (w: number): number =>
    w <= 0 ? -100 : 10 * Math.log10(w) + 30;

/**
 * Free-space path loss (log-distance model)
 * @param distM   distance in metres
 * @param freqMHz frequency in MHz
 * @param n       path-loss exponent (2 = free space, higher = obstructed)
 */
export const calcPathLoss = (distM: number, freqMHz: number, n: number): number => {
    if (distM <= 0.1) return 0;
    return 20 * Math.log10(freqMHz) + 10 * n * Math.log10(distM) - 27.55;
};

/** Default frequency bands pre-loaded into the Robust Transmission simulator */
export const INITIAL_BANDS: RFBand[] = [
    { id: 1, name: 'Remote Control', freq: 433, gain: 3, power: 50, linkDir: 'uplink' },
    { id: 2, name: 'ISM / GSM', freq: 900, gain: 3, power: 50, linkDir: 'uplink' },
    { id: 3, name: 'GPS L2 / Video', freq: 1200, gain: 3, power: 50, linkDir: 'downlink' },
    { id: 4, name: 'L-Band', freq: 1400, gain: 3, power: 50, linkDir: 'downlink' },
    { id: 5, name: 'WiFi 2.4', freq: 2400, gain: 3, power: 50, linkDir: 'uplink' },
    { id: 6, name: '5G / WiMAX', freq: 3300, gain: 3, power: 50, linkDir: 'downlink' },
    { id: 7, name: 'WiFi 5.2', freq: 5200, gain: 3, power: 50, linkDir: 'uplink' },
    { id: 8, name: 'WiFi 5.8', freq: 5800, gain: 3, power: 50, linkDir: 'downlink' },
];

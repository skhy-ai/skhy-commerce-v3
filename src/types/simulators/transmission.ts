import { RFBand } from '../../utils/rfUtils';

export interface HWOption {
    id: string;
    name: string;
    price: number;
    txPowerW?: number;
    rxSensDbm?: number;
    rangeKm?: number;
    freqMhz?: number;
    note?: string;
    imageUrl?: string;
}

export interface SimulationLinkResult {
    targetPowerDbm: number;
    jammerPowerDbm: number;
    jammerLoss: number;
    jammerRx: number;
    linkRx: number;
    relayRx: number;
    bestLinkRx: number;
    sir: number;
    status: string;
    dRelayLeg: number;
    dJammerPath: number;
}

export interface SimulationResult {
    up: SimulationLinkResult;
    down: SimulationLinkResult;
    linkLoss: number;
    dCtrl: number;
    jammerPowerDbm: number;
    envFactor: number;
    status: string;
}

export interface TransmissionState {
    bands: RFBand[];
    envFactor: number;
    activeBandId: number;
    targetDistKm: number;
    altitudeM: number;
    ctrlDistKm: number;
    relayEnabled: boolean;
    relayMode: 'fixed-wing' | 'ground';
    relayAltKm: number;
    relayOffsetKm: number;
    relayDepthKm: number;
    relayPower: number;
    selectedGcs: string;
    selectedAirUnit: string;
    selectedTelemetry: string;
    selectedVideoLink: string;
    jammerEnabled: boolean;
    gcsLinkType: 'rf' | 'fiber';
}

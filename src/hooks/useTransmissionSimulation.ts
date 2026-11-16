import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useMarketplace } from './useMarketplace';
import { wattsToDbm, calcPathLoss, INITIAL_BANDS, RFBand } from '../utils/rfUtils';
import { useMissionState } from '../contexts/MissionStateContext';
import { SimulationResult } from '../types/simulators/transmission';
import { GCS_OPTIONS, AIR_UNIT_OPTIONS, TELEMETRY_OPTIONS, VIDEO_LINK_OPTIONS } from '../data/simulators/transmissionData';

export const useTransmissionSimulation = (platform: 'multirotor' | 'fixed-wing' | 'rover' = 'multirotor') => {
    const { addToCart, setIsOpen: setCartOpen } = useCart();
    const { products } = useMarketplace();
    const { markPhaseComplete } = useMissionState();
    const [isGeneratingBOM, setIsGeneratingBOM] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const interval = 30;
        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += interval;
            const progress = Math.min((elapsed / duration) * 100, 100);
            setLoadingProgress(progress);
            if (progress >= 100) {
                clearInterval(timer);
                setTimeout(() => setIsLoading(false), 200);
            }
        }, interval);
        return () => clearInterval(timer);
    }, []);

    const [bands, setBands] = useState<RFBand[]>(INITIAL_BANDS);
    const [envFactor, setEnvFactor] = useState(2.0);
    const [activeBandId, setActiveBandId] = useState(5);
    const [targetDistKm, setTargetDistKm] = useState(3.0);
    const [altitudeM, setAltitudeM] = useState(100);
    const [ctrlDistKm, setCtrlDistKm] = useState(5.0);

    const [relayEnabled, setRelayEnabled] = useState(false);
    const [relayMode, setRelayMode] = useState<'fixed-wing' | 'ground'>('fixed-wing');
    const [relayAltKm, setRelayAltKm] = useState(5.0);
    const [relayOffsetKm, setRelayOffsetKm] = useState(0.0);
    const [relayDepthKm, setRelayDepthKm] = useState(0.0);
    const [relayPower, setRelayPower] = useState(10.0);

    const [selectedGcs, setSelectedGcs] = useState<string>('siyi_mk15');
    const [selectedGcsAddon, setSelectedGcsAddon] = useState<string>('none');
    const [selectedAirUnit, setSelectedAirUnit] = useState<string>('dji_o3');
    const [selectedAirAddon, setSelectedAirAddon] = useState<string>('none');

    const [jammerEnabled, setJammerEnabled] = useState(true);
    const [gcsLinkType, setGcsLinkType] = useState<'rf' | 'fiber'>('rf');

    const activeBand = useMemo(() => {
        return bands.find(b => b.id === activeBandId) || bands[0] || INITIAL_BANDS[0];
    }, [bands, activeBandId]);

    const availableGcs = useMemo(() => {
        // DB categories: 'GCS' for ground control stations
        const dbItems = products.filter(p =>
            p.category === 'GCS' ||
            p.subcategory === 'Ground Control Station' ||
            p.subcategory === 'Ground Control'
        );
        return [...GCS_OPTIONS, ...dbItems.map(p => ({ id: p.id.toString(), name: p.name, price: p.base_price || 0, txPowerW: p.power_draw_w || 2.0, imageUrl: p.product_assets?.[0]?.file_url }))];
    }, [products]);

    const availableGcsAddons = useMemo(() => {
        // DB categories for GCS add-ons: 'Transmission' (radio/telemetry modules), 'Communication' (MANET) with ground segment
        const dbItems = products.filter(p =>
            (p.category === 'Transmission' && (p.segment === 'ground' || p.segment === 'gcs')) ||
            (p.category === 'Communication' && p.segment === 'ground') ||
            (p.category === 'Communications' && p.segment === 'ground') ||
            p.subcategory === 'Amplifiers'
        );
        return [...TELEMETRY_OPTIONS.map(o => ({ ...o, txPowerW: o.txPowerW || 5.0 })), ...dbItems.map(p => ({ id: p.id.toString(), name: p.name, price: p.base_price || 0, txPowerW: p.power_draw_w || 5.0, imageUrl: p.product_assets?.[0]?.file_url }))];
    }, [products]);

    const availableAirUnits = useMemo(() => {
        // DB categories for air units: segment='air' + Transmission category
        const dbItems = products.filter(p =>
            (p.category === 'Transmission' && p.segment === 'air') ||
            p.subcategory === 'Video TX' ||
            p.subcategory === 'Air Unit'
        );
        return [...AIR_UNIT_OPTIONS, ...dbItems.map(p => ({ id: p.id.toString(), name: p.name, price: p.base_price || 0, txPowerW: p.power_draw_w || 1.0, imageUrl: p.product_assets?.[0]?.file_url }))];
    }, [products]);

    const availableAirAddons = useMemo(() => {
        // Air add-ons: Transmission amplifiers for air, or Communication radios with air segment
        const dbItems = products.filter(p =>
            (p.category === 'Transmission' && p.segment === 'air' && p.subcategory === 'Amplifiers') ||
            (p.category === 'Communication' && p.segment === 'air') ||
            (p.category === 'Communications' && p.segment === 'air')
        );
        return [...VIDEO_LINK_OPTIONS.map(o => ({ ...o, txPowerW: o.txPowerW || 2.0 })), ...dbItems.map(p => ({ id: p.id.toString(), name: p.name, price: p.base_price || 0, txPowerW: p.power_draw_w || 2.0, imageUrl: p.product_assets?.[0]?.file_url }))];
    }, [products]);

    const gcsHw = availableGcs.find(o => o.id === selectedGcs) || availableGcs[0];
    const gcsAddonHw = availableGcsAddons.find(o => o.id === selectedGcsAddon);
    const airHw = availableAirUnits.find(o => o.id === selectedAirUnit) || availableAirUnits[0];
    const airAddonHw = availableAirAddons.find(o => o.id === selectedAirAddon);

    useEffect(() => {
        if (selectedGcs === 'flyspark_fiber' || selectedGcs === 'xfiber_gcu') {
            setGcsLinkType('fiber');
        } else {
            setGcsLinkType('rf');
        }
    }, [selectedGcs]);

    const rcPower = (Number(gcsHw?.txPowerW) || 1.0) + (Number(gcsAddonHw?.txPowerW) || 0);
    const videoPower = (Number(airHw?.txPowerW) || 0.28) + (Number(airAddonHw?.txPowerW) || 0);

    const bomTotal = useMemo(() => {
        return (gcsHw?.price || 0) + (airHw?.price || 0) + (gcsAddonHw?.price || 0) + (airAddonHw?.price || 0);
    }, [gcsHw, airHw, gcsAddonHw, airAddonHw]);

    const handleBandChange = (id: number, field: string, val: any) => {
        setBands(bands.map(b => b.id === id ? { ...b, [field]: val } : b));
    };

    const calcData: SimulationResult = useMemo(() => {
        const rcPowerDbm = wattsToDbm(Number(rcPower) || 0);
        const videoPowerDbm = wattsToDbm(Number(videoPower) || 0);

        const effJammerPowerW = jammerEnabled ? (Number(activeBand?.power) || 0) : 0;
        const jammerPowerDbm = wattsToDbm(effJammerPowerW);

        const dJam = targetDistKm * 1000;
        const h = altitudeM;
        const dSlantJam = Math.sqrt(dJam ** 2 + h ** 2);

        const dCtrl = ctrlDistKm * 1000;
        const dGroundCtrl = Math.sqrt(Math.max(0, dCtrl ** 2 - h ** 2));

        const linkLoss = calcPathLoss(dCtrl, activeBand.freq, 2.1);

        let jamLossUp = calcPathLoss(dSlantJam, activeBand.freq, envFactor);
        let jammerRxUp = jammerPowerDbm + activeBand.gain - jamLossUp;
        if (gcsLinkType === 'fiber') jammerRxUp = -999;
        const linkRxUp = rcPowerDbm + 4.3 - linkLoss;

        const distJamToGcs = dJam + dGroundCtrl;
        const jamLossDown = calcPathLoss(distJamToGcs, activeBand.freq, envFactor);

        let jammerRxDown = jammerPowerDbm + activeBand.gain - jamLossDown;
        if (gcsLinkType === 'fiber') jammerRxDown = -999;

        const linkRxDown = videoPowerDbm + 4.3 - linkLoss;

        const actualRelayAltM = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
        const relayEnvFactor = relayMode === 'ground' ? 2.5 : 2.0;

        let relayRxUp = -999, relayRxDown = -999;
        let bestLinkRxUp = linkRxUp, bestLinkRxDown = linkRxDown;
        let dRelayLegUp = 0, dRelayLegDown = 0;

        const rX = relayOffsetKm * 1000;
        const rZ = relayDepthKm * 1000;

        if (relayEnabled) {
            const dX_drone = targetDistKm * 1000;
            const dZ_drone = 0;
            dRelayLegUp = Math.sqrt((rX - dX_drone) ** 2 + (actualRelayAltM - h) ** 2 + (rZ - dZ_drone) ** 2);
            const rLossUp = calcPathLoss(dRelayLegUp, activeBand.freq, relayEnvFactor);
            relayRxUp = wattsToDbm(relayPower) + 4.3 - rLossUp;
            bestLinkRxUp = Math.max(linkRxUp, relayRxUp);

            const dX_gcs = targetDistKm * 1000 + dGroundCtrl;
            const dZ_gcs = 0;
            dRelayLegDown = Math.sqrt((rX - dX_gcs) ** 2 + actualRelayAltM ** 2 + (rZ - dZ_gcs) ** 2);
            const rLossDown = calcPathLoss(dRelayLegDown, activeBand.freq, relayEnvFactor);
            relayRxDown = wattsToDbm(relayPower) + 4.3 - rLossDown;
            bestLinkRxDown = Math.max(linkRxDown, relayRxDown);
        }

        const sirUp = bestLinkRxUp - jammerRxUp;
        const sirDown = bestLinkRxDown - jammerRxDown;

        const statusUp = sirUp < 0 ? "JAMMED" : sirUp < 5 ? "UNSTABLE" : "ESTABLISHED";
        const statusDown = sirDown < 0 ? "JAMMED" : sirDown < 5 ? "UNSTABLE" : "ESTABLISHED";

        return {
            up: { targetPowerDbm: rcPowerDbm, jammerPowerDbm, jammerLoss: jamLossUp, jammerRx: jammerRxUp, linkRx: linkRxUp, relayRx: relayRxUp, bestLinkRx: bestLinkRxUp, sir: sirUp, status: statusUp, dRelayLeg: dRelayLegUp, dJammerPath: dSlantJam },
            down: { targetPowerDbm: videoPowerDbm, jammerPowerDbm, jammerLoss: jamLossDown, jammerRx: jammerRxDown, linkRx: linkRxDown, relayRx: relayRxDown, bestLinkRx: bestLinkRxDown, sir: sirDown, status: statusDown, dRelayLeg: dRelayLegDown, dJammerPath: distJamToGcs },
            linkLoss, dCtrl, jammerPowerDbm, envFactor,
            status: (sirUp < 0 || sirDown < 0) ? "JAMMED" : (sirUp < 5 || sirDown < 5) ? "UNSTABLE" : "ESTABLISHED"
        };
    }, [activeBand, envFactor, targetDistKm, altitudeM, ctrlDistKm, rcPower, videoPower, relayEnabled, relayAltKm, relayOffsetKm, relayDepthKm, relayPower, relayMode, jammerEnabled, gcsLinkType]);

    const chartData = useMemo(() => {
        const points = 50;
        const maxDist = 25;
        const labels = [];
        const dataJamUp = [];
        const dataDirUp = [];
        const dataRelayUp = [];
        const dataJamDown = [];
        const dataDirDown = [];
        const dataRelayDown = [];

        const dCtrl = ctrlDistKm * 1000;
        const linkLoss = calcPathLoss(dCtrl, activeBand.freq, 2.1);
        const linkRxUp = wattsToDbm(rcPower) + 4.3 - linkLoss;
        const linkRxDown = wattsToDbm(videoPower) + 4.3 - linkLoss;

        for (let i = 0; i <= points; i++) {
            const dKm = Math.max(0.1, (i / points) * maxDist);
            labels.push(dKm.toFixed(1));

            const distToJammerM = dKm * 1000;
            const slantDistM = Math.sqrt(distToJammerM ** 2 + altitudeM ** 2);

            const jamLossUp = calcPathLoss(slantDistM, activeBand.freq, envFactor);
            let jRxUp = wattsToDbm(jammerEnabled ? activeBand.power : 0) + activeBand.gain - jamLossUp;
            if (gcsLinkType === 'fiber') jRxUp = -999;

            let rRxUp = -999;
            if (relayEnabled) {
                const rX = relayOffsetKm * 1000;
                const rY = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
                const rZ = relayDepthKm * 1000;
                const relayEnvF = relayMode === 'ground' ? 2.5 : 2.0;
                const dRelay = Math.sqrt((rX - distToJammerM) ** 2 + (rY - altitudeM) ** 2 + (rZ - 0) ** 2);
                const rLoss = calcPathLoss(dRelay, activeBand.freq, relayEnvF);
                rRxUp = wattsToDbm(relayPower) + 4.3 - rLoss;
            }

            const distJammerToCtrlM = distToJammerM + dCtrl;
            const jamLossDown = calcPathLoss(distJammerToCtrlM, activeBand.freq, envFactor);
            
            let jRxDown = wattsToDbm(jammerEnabled ? activeBand.power : 0) + activeBand.gain - jamLossDown;
            if (gcsLinkType === 'fiber') jRxDown = -999;

            let rRxDown = -999;
            if (relayEnabled) {
                const rX = relayOffsetKm * 1000;
                const cX = distToJammerM + dCtrl;
                const rY = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
                const rZ = relayDepthKm * 1000;
                const relayEnvF = relayMode === 'ground' ? 2.5 : 2.0;
                const dRelay = Math.sqrt((rX - cX) ** 2 + rY ** 2 + (rZ - 0) ** 2);
                const rLoss = calcPathLoss(dRelay, activeBand.freq, relayEnvF);
                rRxDown = wattsToDbm(relayPower) + 4.3 - rLoss;
            }

            dataJamUp.push(jRxUp);
            dataDirUp.push(linkRxUp);
            if (relayEnabled) dataRelayUp.push(rRxUp);

            dataJamDown.push(jRxDown);
            dataDirDown.push(linkRxDown);
            if (relayEnabled) dataRelayDown.push(rRxDown);
        }

        const datasets = [
            { label: 'Jammer Rx @ Drone (dBm)', borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 2, pointRadius: 0, data: dataJamUp, tension: 0.4 },
            { label: 'Uplink Rx @ Drone (dBm)', borderColor: '#10b981', backgroundColor: '#10b981', borderWidth: 2, pointRadius: 0, data: dataDirUp, borderDash: [5, 5] },
            { label: 'Jammer Rx @ GCS (dBm)', borderColor: '#b91c1c', backgroundColor: '#b91c1c', borderWidth: 2, pointRadius: 0, data: dataJamDown, tension: 0.4 },
            { label: 'Downlink Rx @ GCS (dBm)', borderColor: '#0ea5e9', backgroundColor: '#0ea5e9', borderWidth: 2, pointRadius: 0, data: dataDirDown, borderDash: [5, 5] }
        ];

        if (relayEnabled) {
            datasets.push({ label: 'Relay Uplink Rx (dBm)', borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2, pointRadius: 0, data: dataRelayUp, borderDash: [] });
            datasets.push({ label: 'Relay Downlink Rx (dBm)', borderColor: '#d97706', backgroundColor: '#d97706', borderWidth: 2, pointRadius: 0, data: dataRelayDown, borderDash: [] });
        }

        return { labels, datasets };
    }, [activeBand, envFactor, rcPower, videoPower, altitudeM, ctrlDistKm, relayEnabled, relayAltKm, relayOffsetKm, relayDepthKm, relayPower, relayMode, jammerEnabled, gcsLinkType]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
            tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)} dBm` } }
        },
        scales: {
            x: { title: { display: true, text: 'Distance from Jammer (km)', color: '#64748b' }, grid: { color: '#334155' } },
            y: { title: { display: true, text: 'Signal Power (dBm)', color: '#64748b' }, grid: { color: '#334155' }, min: -120, max: 0 }
        }
    };

    const handleGenerateBOM = async () => {
        setIsGeneratingBOM(true);
        // Mappings for Simulator IDs to Production Supabase IDs
        const PRODUCT_MAPPINGS: Record<string, number> = {
            'herelink_1_1': 900035,
            'herelink_video': 900035,
            'rfd900x': 900036,
            'acasom_20w': 900033,
            'silvus_streamcaster': 900021,
            'flyspark_fiber': 900034,
            'xfiber_gcu': 900034,
            'siyi_zr10_air': 276137616,
            'ideaforge_switch_air': 900031,
            'asteria_a400_link': 900032,
            'dji_o3': 900035, // Mapping generic digital to herelink blueprint for wiring
            'dji_o3_video': 900035
        };

        const getProductId = (id: string): string | number => PRODUCT_MAPPINGS[id] || `local_${id}_${Math.abs(id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0))}`;

        const defaultPins = ['VCC', 'GND', 'UART_TX', 'UART_RX', 'SMA_RF', 'VIDEO_IN', 'S.BUS'];
        const antennaPins = ['RF_IN', 'GND', 'SMA_OUT'];

        try {
            if (gcsHw) {
                const pid = getProductId(gcsHw.id);
                await addToCart(pid, 1, { 
                    id: pid, 
                    name: gcsHw.name, 
                    base_price: gcsHw.price,
                    power_draw_w: 15,
                    segment: 'gcs',
                    pin_layout: defaultPins,
                    platform_pill: platform,
                    phase: 'transmission'
                });
            }
            if (airHw) {
                const pid = getProductId(airHw.id);
                await addToCart(pid, 1, { 
                    id: pid, 
                    name: airHw.name, 
                    base_price: airHw.price,
                    power_draw_w: 10,
                    segment: 'air',
                    pin_layout: defaultPins,
                    platform_pill: platform,
                    phase: 'transmission'
                });
            }
            if (gcsAddonHw) {
                const pid = getProductId(gcsAddonHw.id);
                await addToCart(pid, 1, { 
                    id: pid, 
                    name: gcsAddonHw.name, 
                    base_price: gcsAddonHw.price,
                    power_draw_w: 5,
                    segment: 'gcs',
                    pin_layout: antennaPins,
                    platform_pill: platform,
                    phase: 'transmission'
                });
            }
            if (airAddonHw) {
                const pid = getProductId(airAddonHw.id);
                await addToCart(pid, 1, { 
                    id: pid, 
                    name: airAddonHw.name, 
                    base_price: airAddonHw.price,
                    power_draw_w: 8,
                    segment: 'air',
                    pin_layout: antennaPins,
                    platform_pill: platform,
                    phase: 'transmission'
                });
            }

            if (activeBand) {
                const jammerName = `SKHY RF Jammer Module (${activeBand.freq} MHz, ${activeBand.power}W)`;
                const jammerId = getProductId(jammerName);
                const price = (activeBand.power || 0) * 15;
                await addToCart(jammerId, 1, { 
                    id: jammerId, 
                    name: jammerName, 
                    base_price: price,
                    power_draw_w: 50,
                    segment: 'gcs',
                    platform_pill: platform,
                    phase: 'transmission'
                });
            }

            setCartOpen(true);
            markPhaseComplete('transmission', platform);
        } catch (error) {
            console.error("Failed to generate BOM:", error);
        } finally {
            setIsGeneratingBOM(false);
        }
    };

    return {
        state: {
            bands, envFactor, activeBandId, targetDistKm, altitudeM, ctrlDistKm,
            relayEnabled, relayMode, relayAltKm, relayOffsetKm, relayDepthKm, relayPower,
            selectedGcs, selectedAirUnit, selectedGcsAddon, selectedAirAddon,
            jammerEnabled, gcsLinkType, isLoading, loadingProgress, isGeneratingBOM
        },
        controls: {
            setEnvFactor, setActiveBandId, setTargetDistKm, setAltitudeM, setCtrlDistKm,
            setRelayEnabled, setRelayMode, setRelayAltKm, setRelayOffsetKm, setRelayDepthKm, setRelayPower,
            setSelectedGcs, setSelectedAirUnit, setSelectedGcsAddon, setSelectedAirAddon,
            setJammerEnabled, setGcsLinkType, handleBandChange, handleGenerateBOM
        },
        derived: {
            activeBand, gcsHw, airHw, gcsAddonHw, airAddonHw, availableGcs, availableGcsAddons, availableAirUnits, availableAirAddons, rcPower, videoPower, bomTotal, calcData, chartData, chartOptions
        }
    };
};

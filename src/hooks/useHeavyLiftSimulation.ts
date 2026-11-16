import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useMarketplace } from './useMarketplace';
import { useMissionState } from '../contexts/MissionStateContext';
import {
    FRAMES, MOTORS, PROPS, BATTERIES, ESCS, Camera, Motor, Battery
} from '../data/droneComponents';
import { CONFIG_TEMPLATES } from '../data/simulators/heavyLiftData';
import { HIGH_GAIN_TELEMETRY } from '../data/simulators/equipment';
import { parseMotorFromProduct, parseBatteryFromProduct } from '../utils/parseProductSpecs';
import { PRE_GENERATED_CONFIGS } from '../data/preGeneratedConfigs';

export const useHeavyLiftSimulation = () => {
    const { addToCart, removePhaseFromCart, setIsOpen: setCartOpen } = useCart();
    const { products } = useMarketplace();
    const { multirotor, updateMultirotor, markPhaseComplete, completedPhases, resetPhase } = useMissionState();

    // ── UI State ──────────────────────────────────────────────────────────────
    const { frameId, motorId, propId, escId, battId, camera, telemetry, pipeMatId, payloadMass, templateId } = multirotor;

    const setFrameId = (v: string) => updateMultirotor({ frameId: v });
    const setMotorId = (v: string) => updateMultirotor({ motorId: v });
    const setPropId = (v: string) => updateMultirotor({ propId: v });
    const setEscId = (v: string) => updateMultirotor({ escId: v });
    const setBattId = (v: string) => updateMultirotor({ battId: v });
    const setCamera = (v: Camera) => updateMultirotor({ camera: v });
    const setTelemetry = (v: string) => updateMultirotor({ telemetry: v });
    const setPipeMatId = (v: string) => updateMultirotor({ pipeMatId: v });
    const setPayloadMass = (v: number) => updateMultirotor({ payloadMass: v });
    const setTemplateId = (v: string) => updateMultirotor({ templateId: v });

    const [calcVisible, setCalcVisible] = useState(false);
    const [isGeneratingBOM, setIsGeneratingBOM] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const isPhaseCompleted = completedPhases.drone.multirotor;

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

    // ── DB → Motor: parse real specs from features[] ──────────────────────────
    const dbMotors = useMemo(() => products
        .filter(p => p.category === 'Motors')
        .map(p => {
            const specs = parseMotorFromProduct(p);
            return {
                id: p.id.toString(),
                name: p.name,
                brand: p.manufacturer || 'SKHY',
                class: specs.class,
                weight_kg: p.weight_kg || 0.1,
                max_thrust_kg: specs.max_thrust_kg,
                voltage_req: specs.voltage_req,
                efficiency_hover: specs.efficiency_hover,
                kv: specs.kv,
                watts_max: specs.watts_max,
                max_amps: specs.max_amps,
                price: p.base_price || 0,
                imageUrl: p.product_assets?.[0]?.file_url,
                isDbProduct: true,
                dbProductId: p.id,
            } satisfies Motor & { isDbProduct: boolean; dbProductId: number };
        }), [products]);

    // ── DB → Battery: parse real capacity from features[] ────────────────────
    const dbBatteries = useMemo(() => products
        .filter(p => p.category === 'Batteries' || p.category === 'Power Systems')
        .flatMap(p => {
            const specs = parseBatteryFromProduct(p);
            if (!specs) return []; // skip if capacity can't be determined
            return [{
                id: p.id.toString(),
                name: p.name,
                type: specs.type,
                voltage: specs.voltage,
                capacity_wh: specs.capacity_wh,
                weight_kg: p.weight_kg || 1.0,
                price: p.base_price || 0,
                imageUrl: p.product_assets?.[0]?.file_url,
                isDbProduct: true,
                dbProductId: p.id,
                // extended specs for display
                capacity_ah: specs.capacity_ah,
                max_discharge_a: specs.max_discharge_a,
            } satisfies Battery & { isDbProduct: boolean; dbProductId: number; capacity_ah: number; max_discharge_a: number }];
        }), [products]);

    const allMotors = useMemo(() => [...MOTORS, ...dbMotors], [dbMotors]);
    const allBatteries = useMemo(() => [...BATTERIES, ...dbBatteries], [dbBatteries]);

    // ── Derived selections ───────────────────────────────────────────────────
    const frame = FRAMES[frameId];

    /**
     * Show ALL motors but annotate compatibility.
     * Hides nothing — incompatible motors shown with a ⚠️ tag in the sidebar.
     */
    const availableMotors = useMemo(() =>
        allMotors.map(m => ({
            ...m,
            compatible: m.class === frame?.class || m.class === 'medium',
        })),
        [frame, allMotors]
    );

    const availableProps = useMemo(() =>
        PROPS.filter(p => p.size >= (frame?.min_prop || 10) && p.size <= (frame?.max_prop || 17)),
        [frame]
    );

    // Auto-correct motor/prop selection when frame changes
    useEffect(() => {
        const compatibleMotors = availableMotors.filter(m => m.compatible);
        if (!availableMotors.find(m => m.id === motorId)) {
            setMotorId(compatibleMotors[0]?.id || availableMotors[0]?.id || "");
        }
        if (!availableProps.find(p => p.id === propId)) {
            setPropId(availableProps[0]?.id || "");
        }
    }, [frameId, availableMotors, availableProps]);

    // Template application
    useEffect(() => {
        if (!templateId) return;
        const searchIdHyphen = templateId.replace(/_/g, '-');
        const searchIdUnder = templateId.replace(/-/g, '_');
        
        // Try to find it in PRE_GENERATED_CONFIGS first
        const preGen = PRE_GENERATED_CONFIGS.find(c => c.id === searchIdHyphen || c.id === searchIdUnder);
        if (preGen && preGen.platform === 'multirotor') {
            setFrameId(preGen.bom.frameId);
            setMotorId(preGen.bom.motorId);
            setPropId(preGen.bom.propId || 'p13_carbon'); // default if missing
            setEscId(preGen.bom.escId);
            setBattId(preGen.bom.battId);
            setPayloadMass(parseFloat(preGen.specs.maxPayload) || 0);
            return;
        }

        const normalizedId = templateId.replace(/-/g, '_');
        if (!CONFIG_TEMPLATES[normalizedId as keyof typeof CONFIG_TEMPLATES]) return;
        const config = CONFIG_TEMPLATES[normalizedId as keyof typeof CONFIG_TEMPLATES];
        setFrameId(config.frame);
        setMotorId(config.motor);
        setPropId(config.prop);
        setEscId(config.esc);
        setBattId(config.batt);
        setPayloadMass(config.payload);
    }, [templateId]);

    // ── DB → Payloads (Cameras/Sensors) ──────────────────────────────────────────
    const dbPayloads = useMemo(() => products
        .filter(p => p.category === 'Payloads' || p.category === 'Navigation & Sensors')
        .map(p => ({
            id: p.id.toString(),
            name: p.name,
            weight_kg: p.weight_kg || 0.5,
            price: p.base_price || 0,
            imageUrl: p.product_assets?.[0]?.file_url,
            isDbProduct: true,
            dbProductId: p.id,
        })), [products]);

    const availableCameras = useMemo(() => [
        { id: 'none', name: 'None', weight_kg: 0, price: 0 },
        ...dbPayloads
    ], [dbPayloads]);

    const motor = allMotors.find(m => m.id === motorId) || availableMotors[0];
    const prop = PROPS.find(p => p.id === propId) || availableProps[0];
    const batt = allBatteries.find(b => b.id === battId) || allBatteries[0];
    const escData = ESCS[escId];

    // ── Physics Calculation (fully spec-driven) ──────────────────────────────
    const calcData = useMemo(() => {
        if (!motor || !prop || !batt || !escData || !frame) return null;

        // ── Mass Budget ──
        const motorMass   = motor.weight_kg * frame.arms;
        const propMass    = prop.weight_kg * frame.arms;
        const escMass     = escData.type === '4in1'
                            ? escData.weight_kg
                            : escData.weight_kg * frame.arms;
        const telemetryMass = telemetry === 'high-gain' ? HIGH_GAIN_TELEMETRY.weight_kg : 0.030;
        const gpsMass       = 0.050;
        const totalPayload  = payloadMass + camera.weight_kg;
        const totalAUW      = frame.weight_kg + motorMass + propMass + batt.weight_kg
                            + escMass + telemetryMass + gpsMass + totalPayload;

        // ── Thrust ──
        const totalMaxThrust = motor.max_thrust_kg * frame.arms;
        const hoverThrottle  = totalMaxThrust > 0 ? (totalAUW / totalMaxThrust) * 100 : 0;

        // ── Power (physics-driven from motor efficiency) ──
        // η = g/W at hover. Hover power = AUW_g / η
        const hoverPowerW = (totalAUW * 1000) / motor.efficiency_hover;

        // ── Endurance ──
        // 80% usable capacity (20% reserve)
        const usableWh      = batt.capacity_wh * 0.80;
        const flightTimeHrs = usableWh / hoverPowerW;

        // ── Range ──
        // Top speed from RPM model: RPM = KV × V × 0.75 (prop load derating)
        // Tip speed limit prevents unrealistic results for large-prop industrial motors
        const rpmLoad = motor.kv * batt.voltage * 0.75;
        const pitchInches = prop.size * 0.40;
        let topSpeedKmh = rpmLoad * pitchInches * 0.001524; // pitch-speed formula
        // Realistic cap: medium drones ≈ 60 km/h, industrial ≈ 40 km/h
        topSpeedKmh = frame.class === 'industrial'
            ? Math.min(topSpeedKmh * 0.6, 45)
            : Math.min(topSpeedKmh * 0.8, 72);

        const cruiseSpeedKmh = topSpeedKmh * 0.65; // cruise at 65% top speed
        const rangeKm = flightTimeHrs * cruiseSpeedKmh;

        // ── Safety Checks ──
        const voltageMismatch = motor.voltage_req !== batt.type;
        const overweight      = hoverThrottle > 75;
        const escMismatch     = motor.max_amps > escData.rating;

        // ── Tarot Config Advisory ──
        let tarotStatus = null;
        if (frameId === 'tarot_650') {
            const is4S  = Math.abs(batt.voltage - 14.8) < 1;
            const is6S  = Math.abs(batt.voltage - 22.2) < 1;
            const is20A = escData.rating <= 20;
            const is30A = escData.rating > 20 && escData.rating <= 30;

            if (motor.watts_max <= 250 && is20A && is4S && prop.size <= 12) {
                tarotStatus = { text: "✅ Recommended (GoPro Config)", color: "text-emerald-400", bg: "bg-emerald-900 border-emerald-500" };
            } else if (motor.watts_max <= 400 && is30A && is4S && prop.size <= 14) {
                tarotStatus = { text: "✅ General (SLR-Like Config)", color: "text-emerald-400", bg: "bg-emerald-900 border-emerald-500" };
            } else if (motor.watts_max >= 400 && is6S && prop.size >= 14) {
                tarotStatus = { text: "⚠️ Not Recommended (Frame Stress)", color: "text-amber-400", bg: "bg-amber-900 border-amber-500" };
            } else {
                tarotStatus = { text: "ℹ️ Custom Config (Check Specs)", color: "text-sky-400", bg: "bg-slate-800 border-sky-500" };
            }
        }

        return {
            // Mass breakdown — passed to PayloadRangeLogic for full detail display
            motorMass, propMass, escMass, telemetryMass, gpsMass,
            frameMass: frame.weight_kg,
            battMass: batt.weight_kg,
            totalPayload, totalAUW, totalMaxThrust,

            // Performance
            hoverThrottle, hoverPowerW, usableWh, flightTimeHrs,
            cruiseSpeedKmh, rangeKm,
            payloadReserve: (totalMaxThrust * 0.70) - totalAUW,

            // Safety
            voltageMismatch, overweight, escMismatch, tarotStatus,

            // Motor physics (for display)
            motorEfficiency: motor.efficiency_hover,
            motorKv: motor.kv,
            motorWattsMax: motor.watts_max,
        };
    }, [frame, motor, prop, escData, batt, camera, payloadMass, frameId, telemetry]);

    const isConfigValid = useMemo(() => {
        if (!calcData) return false;
        return !calcData.escMismatch && !calcData.voltageMismatch && !calcData.overweight;
    }, [calcData]);

    // ── BOM Generation ────────────────────────────────────────────────────────
    const getProductId = (id: string) =>
        `local_${id}_${Math.abs(id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0))}`;

    const handleGenerateBOM = async () => {
        if (!isConfigValid) return;
        setIsGeneratingBOM(true);
        try {
            const framePid = getProductId(frameId);
            await addToCart(framePid, 1, { id: framePid, name: frame.desc || `${frameId} Frame`, base_price: frame.price || 150, platform_pill: 'multirotor', phase: 'drone' });

            const motorPid = (motor as any).isDbProduct ? (motor as any).dbProductId.toString() : getProductId(motor.id);
            await addToCart(motorPid, frame.arms, { id: motorPid, name: motor.name, base_price: motor.price || 50, platform_pill: 'multirotor', phase: 'drone' });

            const propPid = getProductId(prop.id);
            await addToCart(propPid, frame.arms, { id: propPid, name: prop.name, base_price: prop.price || 15, platform_pill: 'multirotor', phase: 'drone' });

            const escQty = escData.type === '4in1' ? Math.ceil(frame.arms / 4) : frame.arms;
            const escPid = getProductId(escId);
            await addToCart(escPid, escQty, { id: escPid, name: escData.name, base_price: escData.price || 30, platform_pill: 'multirotor', phase: 'drone' });

            const battPid = (batt as any).isDbProduct ? (batt as any).dbProductId.toString() : getProductId(batt.id);
            await addToCart(battPid, 1, { id: battPid, name: batt.name, base_price: batt.price || 120, category: 'batteries', platform_pill: 'multirotor', phase: 'drone' });

            if (camera.id !== 'none') {
                const camPid = (camera as any).isDbProduct ? (camera as any).dbProductId.toString() : getProductId(camera.id);
                await addToCart(camPid, 1, { id: camPid, name: camera.name, base_price: camera.price, power_draw_w: 10, segment: 'air', platform_pill: 'multirotor', phase: 'drone' });
            }

            if (telemetry === 'high-gain') {
                await addToCart(HIGH_GAIN_TELEMETRY.id, 1, {
                    id: HIGH_GAIN_TELEMETRY.id,
                    name: HIGH_GAIN_TELEMETRY.name,
                    base_price: HIGH_GAIN_TELEMETRY.price,
                    power_draw_w: HIGH_GAIN_TELEMETRY.power_draw_w,
                    segment: HIGH_GAIN_TELEMETRY.segment,
                    platform_pill: 'multirotor',
                    phase: 'drone'
                });
            }

            setCartOpen(true);
            markPhaseComplete('drone', 'multirotor');
        } catch (error) {
            console.error("Failed to generate BOM:", error);
        } finally {
            setIsGeneratingBOM(false);
        }
    };

    const handleUnlockPhase = () => {
        resetPhase('drone', 'multirotor');
        removePhaseFromCart('drone', 'multirotor');
    };

    const matchedPresetProduct = useMemo(() => {
        if (!templateId) return null;
        const searchIdHyphen = templateId.replace(/_/g, '-');
        const searchIdUnder = templateId.replace(/-/g, '_');
        const bp = PRE_GENERATED_CONFIGS.find(c => c.id === searchIdHyphen || c.id === searchIdUnder);
        if (!bp || !bp.productId) return null;
        return products.find(p => p.id.toString() === bp.productId) || null;
    }, [templateId, products]);

    return {
        state: {
            frameId, motorId, propId, escId, battId, camera, telemetry,
            pipeMatId, payloadMass, templateId, calcVisible,
            isGeneratingBOM, isLoading, loadingProgress
        },
        controls: {
            setFrameId, setMotorId, setPropId, setEscId, setBattId,
            setCamera, setTelemetry, setPipeMatId, setPayloadMass,
            setTemplateId, setCalcVisible, handleGenerateBOM, handleUnlockPhase
        },
        derived: {
            frame, availableMotors, availableProps, motor, prop, batt,
            escData, calcData, isConfigValid, allBatteries, availableCameras, isPhaseCompleted,
            matchedPresetProduct
        }
    };
};

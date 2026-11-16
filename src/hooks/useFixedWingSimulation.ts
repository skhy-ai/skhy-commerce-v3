import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useMarketplace } from './useMarketplace';
import { useMissionState } from '../contexts/MissionStateContext';
import { FRAMES, MOTORS, BATTERIES, Camera, Motor, Battery } from '../data/droneComponents';
import { parseMotorFromProduct, parseBatteryFromProduct } from '../utils/parseProductSpecs';
import { FIXED_WING_TEMPLATES } from '../data/simulators/fixedWingData';
import { PRE_GENERATED_CONFIGS } from '../data/preGeneratedConfigs';

export const useFixedWingSimulation = () => {
  const { addToCart, removePhaseFromCart, setIsOpen: setCartOpen } = useCart();
  const { products } = useMarketplace();
  const { fixedWing, updateFixedWing, markPhaseComplete, completedPhases, resetPhase } = useMissionState();

  // ── Sim Render State ─────────────────────────────────────────────────────
  const [tick, setTick] = useState(0);
  const [throttle, setThrottle] = useState(68);

  // ── Architecture/UI State ─────────────────────────────────────────────────
  const { frameId, motorId, wingMotorId, thrusterType, battId, camera, payloadMass, cruiseSpeedKmh, motorCount, edgeDeviceId, noseSensor, templateId } = fixedWing;

  const setFrameId = (v: string) => updateFixedWing({ frameId: v });
  const setMotorId = (v: string) => updateFixedWing({ motorId: v });
  const setWingMotorId = (v: string) => updateFixedWing({ wingMotorId: v });
  const setThrusterType = (v: 'propeller' | 'jet') => updateFixedWing({ thrusterType: v });
  const setCamera = (v: Camera) => updateFixedWing({ camera: v });
  const setPayloadMass = (v: number) => updateFixedWing({ payloadMass: v });
  const setCruiseSpeedKmh = (v: number) => updateFixedWing({ cruiseSpeedKmh: v });
  const setMotorCount = (v: number) => updateFixedWing({ motorCount: v }); // wing motors
  const setEdgeDeviceId = (v: string) => updateFixedWing({ edgeDeviceId: v });
  const setNoseSensor = (v: 'plain' | 'acoustic_a7' | 'acoustic_a16') => updateFixedWing({ noseSensor: v });
  const setBattId = (v: string) => updateFixedWing({ battId: v });
  const setTemplateId = (v: string) => updateFixedWing({ templateId: v });

  
  const isPhaseCompleted = completedPhases.drone['fixed-wing'];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  const t = tick * 0.05;
  const ias   = Math.round(108 + Math.sin(t * 0.9) * 8);
  const alt   = Math.round(3200 + Math.sin(t * 0.4) * 120);
  const hdg   = Math.round(((274 + Math.sin(t * 0.15) * 4) + 360) % 360);
  const vsi   = Math.round(Math.sin(t * 0.7) * 60);
  const roll  = Math.sin(t * 0.5) * 15;
  const pitch = Math.sin(t * 0.3) * 8;

  // ── DB → Motor (physics-parsed) ──────────────────────────────────────────
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

  // ── DB → Battery (physics-parsed) ────────────────────────────────────────
  const dbBatteries = useMemo(() => products
    .filter(p => p.category === 'Batteries' || p.category === 'Power Systems')
    .flatMap(p => {
      const specs = parseBatteryFromProduct(p);
      if (!specs) return [];
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
        capacity_ah: specs.capacity_ah,
        max_discharge_a: specs.max_discharge_a,
      } satisfies Battery & { isDbProduct: boolean; dbProductId: number; capacity_ah: number; max_discharge_a: number }];
    }), [products]);

  const allMotors    = useMemo(() => [...MOTORS, ...dbMotors], [dbMotors]);
  const allBatteries = useMemo(() => [...BATTERIES, ...dbBatteries], [dbBatteries]);

  // ── Derived selections ────────────────────────────────────────────────────
  const frame = FRAMES[frameId] || Object.values(FRAMES).find(f => f.type === 'fixed-wing');

  /** All motors shown; compatible = medium class or matching frame class */
  const availableMotors = useMemo(() =>
    allMotors.map(m => ({
      ...m,
      compatible: m.class === frame?.class || m.class === 'medium',
    })),
    [frame, allMotors]
  );

  const motor = availableMotors.find(m => m.id === motorId) || availableMotors[0];
  const wingMotor = availableMotors.find(m => m.id === wingMotorId) || availableMotors[0];
  const batt  = allBatteries.find(b => b.id === battId) || allBatteries[0];

  // Template application
  useEffect(() => {
      if (!templateId) return;
      const searchIdHyphen = templateId.replace(/_/g, '-');
      const searchIdUnder = templateId.replace(/-/g, '_');
      
      // Try to find it in PRE_GENERATED_CONFIGS first
      const preGen = PRE_GENERATED_CONFIGS.find(c => c.id === searchIdHyphen || c.id === searchIdUnder);
      if (preGen && preGen.platform === 'fixed-wing') {
          setFrameId(preGen.bom.frameId);
          setMotorId(preGen.bom.motorId);
          setBattId(preGen.bom.battId);
          setPayloadMass(parseFloat(preGen.specs.maxPayload) || 0);
          setCruiseSpeedKmh(70); // default
          setMotorCount(2); // default
          return;
      }

      const normalizedId = templateId.replace(/-/g, '_');
      if (!FIXED_WING_TEMPLATES[normalizedId as keyof typeof FIXED_WING_TEMPLATES]) return;
      const config = FIXED_WING_TEMPLATES[normalizedId as keyof typeof FIXED_WING_TEMPLATES];
      setFrameId(config.frame);
      setMotorId(config.motor);
      setBattId(config.batt);
      setPayloadMass(config.payload);
      setCruiseSpeedKmh(config.cruiseSpeedKmh);
      setMotorCount(config.motorCount);
  }, [templateId]);

  // ── Physics Calculation ───────────────────────────────────────────────────
  const calcData = useMemo(() => {
    if (!frame || !motor || !batt) return null;

    // ── Mass Budget ──
    const pusherMass = motor.weight_kg;
    const wingMotorsMass = wingMotor.weight_kg * motorCount;
    const totalAUW  = frame.weight_kg + payloadMass + pusherMass + wingMotorsMass + batt.weight_kg
                    + (camera?.weight_kg || 0);

    // ── Aerodynamics ──
    const glideRatio   = frame.glide_ratio || 15;
    const cruiseThrustKg = totalAUW / glideRatio;

    // ── Power Budget ──
    const cruiseV_ms    = cruiseSpeedKmh / 3.6;
    const cruisePowerW  = (totalAUW * 9.81 * cruiseV_ms) / (glideRatio * 0.80);

    // ── Endurance & Range ──
    const usableWh      = batt.capacity_wh * 0.80;
    const flightTimeHrs = usableWh / cruisePowerW;
    const rangeKm       = cruiseSpeedKmh * flightTimeHrs;

    // ── Thrust Budget ──
    const totalMaxThrust   = motor.max_thrust_kg + (wingMotor.max_thrust_kg * motorCount);
    const takeoffThrustKg  = totalMaxThrust;
    const landingThrustKg  = cruiseThrustKg * 0.45;

    const hoverThrottle   = totalMaxThrust > 0
                            ? (cruiseThrustKg / totalMaxThrust) * 100
                            : 0;

    return {
      frameMass: frame.weight_kg,
      motorMass: pusherMass + wingMotorsMass,
      battMass: batt.weight_kg,
      totalAUW,
      glideRatio,
      cruiseThrustKg,
      takeoffThrustKg,
      landingThrustKg,
      cruisePowerW,
      usableWh,
      cruiseSpeedKmh,
      rangeKm,
      flightTimeHrs,
      totalMaxThrust,
      hoverThrottle,
      payloadReserve: (totalMaxThrust * 0.70) - totalAUW,
      payloadActive: payloadMass > 0,
      motorEfficiency: motor.efficiency_hover,
    };
  }, [frame, motor, batt, payloadMass, cruiseSpeedKmh, motorCount, camera, wingMotor]);

  // ── BOM ──────────────────────────────────────────────────────────────────
  const getProductId = (id: string) =>
    `local_${id}_${Math.abs(id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0))}`;

  const handleGenerateBOM = async () => {
    try {
      const framePid = getProductId(frameId);
      await addToCart(framePid, 1, { id: framePid, name: frame.desc || `${frameId} Frame`, base_price: frame.price || 150, platform_pill: 'fixed-wing', phase: 'drone' });

      if (motor) {
        const motorPid = getProductId(motor.id);
        await addToCart(motorPid, 1, { id: motorPid, name: motor.name + " (Pusher)", base_price: motor.price || 50, category: 'propulsion', platform_pill: 'fixed-wing', phase: 'drone' });
      }

      if (motorCount > 0 && wingMotor) {
        const wMotorPid = getProductId(wingMotor.id);
        await addToCart(wMotorPid, motorCount, { id: wMotorPid, name: wingMotor.name + ` (${thrusterType})`, base_price: wingMotor.price || 50, category: 'propulsion', platform_pill: 'fixed-wing', phase: 'drone' });
      }

      if (batt) {
        const battPid = getProductId(batt.id);
        await addToCart(battPid, 1, { id: battPid, name: batt.name, base_price: batt.price || 120, category: 'batteries', platform_pill: 'fixed-wing', phase: 'drone' });
      }

      if (camera && camera.id !== 'none') {
        const camPid = getProductId(camera.id);
        await addToCart(camPid, 1, { id: camPid, name: camera.name, base_price: camera.price, power_draw_w: 10, segment: 'air', platform_pill: 'fixed-wing', phase: 'drone' });
      }

      if (edgeDeviceId) {
        const edgeProduct = products.find(p => p.id.toString() === edgeDeviceId);
        await addToCart(edgeDeviceId, 1, { 
          id: edgeDeviceId, 
          name: edgeProduct ? edgeProduct.name : 'SKHY Light Edge', 
          base_price: edgeProduct ? edgeProduct.base_price : 1200, 
          power_draw_w: edgeProduct ? edgeProduct.power_draw_w : 15, 
          segment: 'air',
          platform_pill: 'fixed-wing', 
          phase: 'drone' 
        });
      }

      setCartOpen(true);
      markPhaseComplete('drone', 'fixed-wing');
    } catch (error) {
      console.error("Failed to generate BOM:", error);
    }
  };

  const handleUnlockPhase = () => {
    resetPhase('drone', 'fixed-wing');
    removePhaseFromCart('drone', 'fixed-wing');
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
      tick, throttle, t, frameId, motorId, wingMotorId, thrusterType, battId, camera,
      payloadMass, cruiseSpeedKmh, motorCount, edgeDeviceId, noseSensor, templateId
    },
    controls: {
      setThrottle, setFrameId, setMotorId, setWingMotorId, setThrusterType, setBattId, setCamera,
      setPayloadMass, setCruiseSpeedKmh, setMotorCount, setEdgeDeviceId, setNoseSensor, setTemplateId, handleGenerateBOM, handleUnlockPhase
    },
    derived: {
      ias, alt, hdg, vsi, roll, pitch,
      frame, motor, batt, wingMotor, calcData, allBatteries, availableMotors, isPhaseCompleted,
      matchedPresetProduct
    }
  };
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
    ShieldAlert, AlertTriangle, Battery, Gauge, Weight,
    ShoppingCart, Loader2, Cpu, CarFront, CircleDot, Settings,
    Scale, Zap, Ruler, Info, Calculator, ChevronDown, ChevronUp, Video, Activity
} from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import { useMarketplace } from '../../../hooks/useMarketplace';
import { useTheme } from '../../../contexts/ThemeContext';

// ==========================================
// 1. REAL-WORLD DATA DEFINITIONS
// ==========================================

const CHASSIS_TYPES = {
    "chassis_agilex": { id: "chassis_agilex", name: "AgileX Scout Mini (Carbon)", weight_kg: 4.5, price: 1200, size: [0.6, 0.15, 0.4], color: 0x222222, imageUrl: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=150&h=150&fit=crop" },
    "chassis_clearpath": { id: "chassis_clearpath", name: "Clearpath Jackal Base (Alum)", weight_kg: 8.5, price: 2100, size: [0.8, 0.2, 0.5], color: 0x8899a6, imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&h=150&fit=crop" },
    "chassis_aion": { id: "chassis_aion", name: "AION R1 UGV Frame (Steel)", weight_kg: 15.0, price: 3400, size: [1.2, 0.25, 0.8], color: 0xd97706, imageUrl: "https://images.unsplash.com/photo-1620825937374-87fc7d6aaf63?w=150&h=150&fit=crop" }
};

const MOTORS = {
    "motor_mn4006": { id: "motor_mn4006", name: "T-Motor MN4006 (380KV) Geared", weight_kg: 0.15, price: 70, kv: 380, max_amps: 25, torque_nm: 1.2, gear_ratio: 5, imageUrl: "https://vtakeoff.com/wp-content/uploads/2023/03/New-Project-24.jpg" },
    "motor_kde4014": { id: "motor_kde4014", name: "KDE Direct 4014XF (380KV) Drive", weight_kg: 0.4, price: 95, kv: 380, max_amps: 60, torque_nm: 3.5, gear_ratio: 15, imageUrl: "https://www.kdedirect.com/cdn/shop/products/KDE4014XF-380-D5_C_2048x2048.jpg" },
    "motor_p80": { id: "motor_p80", name: "T-Motor P80 III (100KV) HD Drive", weight_kg: 0.85, price: 200, kv: 100, max_amps: 40, torque_nm: 8.0, gear_ratio: 10, imageUrl: "https://offthegridsun.com/images/6030_dimg3.jpg" }
};

const WHEELS = {
    "wheel_90mm": { id: "wheel_90mm", name: "Dagu 90mm All-Terrain", weight_kg: 0.15, price: 25, radius: 0.045, width: 0.05, color: 0x111111, imageUrl: "https://images.unsplash.com/photo-1601058268499-e52658b8ebf8?w=150&h=150&fit=crop" },
    "wheel_120mm": { id: "wheel_120mm", name: "Traxxas 120mm Canyon Trail", weight_kg: 0.35, price: 45, radius: 0.06, width: 0.07, color: 0x1a1a1a, imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=150&h=150&fit=crop" },
    "wheel_160mm": { id: "wheel_160mm", name: "Pololu 160mm Heavy Tracks", weight_kg: 1.2, price: 180, radius: 0.08, width: 0.10, color: 0x2a2a2a, imageUrl: "https://images.unsplash.com/photo-1563452675059-debaea78426e?w=150&h=150&fit=crop" }
};

const BATTERIES = {
    "batt_4s": { id: "batt_4s", name: "Tattu 4S 5000mAh LiPo", weight_kg: 0.45, price: 65, voltage: 14.8, capacity_wh: 74.0, imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?w=150&h=150&fit=crop" },
    "batt_6s": { id: "batt_6s", name: "MaxAmps 6S 12000mAh LiPo", weight_kg: 1.4, price: 250, voltage: 22.2, capacity_wh: 266.4, imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?w=150&h=150&fit=crop" },
    "batt_12s": { id: "batt_12s", name: "SKHY 12S 22000mAh Li-Ion", weight_kg: 4.5, price: 850, voltage: 44.4, capacity_wh: 976.8, imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?w=150&h=150&fit=crop" }
};

const CAMERAS = {
    "cam_none": { id: "cam_none", name: "No Optics Payload", weight_kg: 0, price: 0, range_km: 0, imageUrl: null },
    "cam_runcam": { id: "cam_runcam", name: "RunCam Split 4", weight_kg: 0.05, price: 80, range_km: 1, imageUrl: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=150&h=150&fit=crop" },
    "cam_unbtek": { id: "cam_unbtek", name: "UNBTEk EO (Ind) Gimbal", weight_kg: 0.81, price: 1200, range_km: 5, imageUrl: "https://img.waimaoniu.net/2229/2229-202306011454374283.jpg?x-oss-process=image" },
    "cam_skhy": { id: "cam_skhy", name: "SKHY EO/IR Pod V1", weight_kg: 1.25, price: 1500, range_km: 15, imageUrl: "https://i.ibb.co/8DWd3ff3/7-MEMS-mounted-on-drone.png" }
};

const ROVER_TEMPLATES = {
    "preset_scout": {
        name: "Fast Scout Rover (4x4)",
        chassis: "chassis_agilex",
        motor: "motor_mn4006",
        wheel: "wheel_90mm",
        batt: "batt_4s",
        payload: 1.0,
        wheelCount: 4,
        hasArmorCage: false,
        camera: "cam_runcam"
    },
    "preset_explorer": {
        name: "Off-Road Explorer (4x4)",
        chassis: "chassis_clearpath",
        motor: "motor_kde4014",
        wheel: "wheel_120mm",
        batt: "batt_6s",
        payload: 5.0,
        wheelCount: 4,
        hasArmorCage: false,
        camera: "cam_unbtek"
    },
    "preset_hauler": {
        name: "Heavy Industrial Hauler (6x6)",
        chassis: "chassis_aion",
        motor: "motor_p80",
        wheel: "wheel_160mm",
        batt: "batt_12s",
        payload: 25.0,
        wheelCount: 6,
        hasArmorCage: true,
        camera: "cam_skhy"
    }
};

// ==========================================
// 2. SIMULATION HOOK
// ==========================================

function useRoverSimulation() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const [chassisId, setChassisId] = useState("chassis_clearpath");
    const [motorId, setMotorId] = useState("motor_kde4014");
    const [wheelId, setWheelId] = useState("wheel_120mm");
    const [battId, setBattId] = useState("batt_6s");
    const [cameraId, setCameraId] = useState("cam_unbtek");
    const [payloadMass, setPayloadMass] = useState(5.0);
    const [wheelCount, setWheelCount] = useState(4);
    const [hasArmorCage, setHasArmorCage] = useState(false);
    const [edgeDeviceId, setEdgeDeviceId] = useState("900010"); // SKHY Resilient Edge
    const [templateId, setTemplateId] = useState("");
    const [calcVisible, setCalcVisible] = useState(false);
    const { addToCart, setIsOpen: setCartOpen } = useCart();
    const { products } = useMarketplace();

    // Simulate Loading Boot
    useEffect(() => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => setIsLoading(false), 500);
            }
            setLoadingProgress(progress);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Apply Templates
    useEffect(() => {
        if (templateId && templateId in ROVER_TEMPLATES) {
            const t = ROVER_TEMPLATES[templateId as keyof typeof ROVER_TEMPLATES];
            setChassisId(t.chassis);
            setMotorId(t.motor);
            setWheelId(t.wheel);
            setBattId(t.batt);
            setCameraId(t.camera || "cam_unbtek");
            setPayloadMass(t.payload);
            setWheelCount(t.wheelCount);
        }
    }, [templateId]);

    const derived = useMemo(() => {
        const chassis = CHASSIS_TYPES[chassisId as keyof typeof CHASSIS_TYPES];
        const motor = MOTORS[motorId as keyof typeof MOTORS];
        const wheel = WHEELS[wheelId as keyof typeof WHEELS];
        const batt = BATTERIES[battId as keyof typeof BATTERIES];
        const cameraPayload = CAMERAS[cameraId as keyof typeof CAMERAS];

        // Drivetrain Math (4x4 or 6x6)
        const numMotors = wheelCount;
        const numWheels = wheelCount;

        const massChassis = chassis.weight_kg;
        const massMotors = motor.weight_kg * numMotors;
        const massWheels = wheel.weight_kg * numWheels;
        const massBatt = batt.weight_kg;
        const massCamera = cameraPayload.weight_kg;
        const massArmor = hasArmorCage ? 2.5 : 0;

        const totalWeight = massChassis + massMotors + massWheels + massBatt + massCamera + payloadMass + massArmor;

        // Speed Calculation: RPM = KV * V. Added Gear Ratio for realistic UGV speeds.
        const motorRpm = motor.kv * batt.voltage * 0.8;
        const wheelRpm = motorRpm / motor.gear_ratio;
        const maxSpeedMs = (wheelRpm / 60) * (2 * Math.PI * wheel.radius);
        const maxSpeedKmh = maxSpeedMs * 3.6;

        // Torque and Climbing
        const wheelTorque = (motor.torque_nm * numMotors) * motor.gear_ratio * 0.85;
        const maxIncline = Math.min(45, (wheelTorque / (totalWeight * 9.81 * wheel.radius)) * 20);

        // Range Calculation
        const avgDrawWatts = totalWeight * 3.5; // Rough heuristic: 3.5W per kg to maintain off-road cruise
        const usableWh = batt.capacity_wh * 0.8; // 80% safe depth of discharge
        const runTimeHours = usableWh / Math.max(1, avgDrawWatts);
        const flightTimeMin = runTimeHours * 60;
        const cruisingSpeedKmh = maxSpeedKmh * 0.5; // Cruise at 50% of max speed
        const estRangeKm = runTimeHours * cruisingSpeedKmh;

        // Warnings
        const warnings = [];
        if (totalWeight > (chassis.weight_kg * 4)) warnings.push("Chassis overloaded! Risk of structural failure.");
        if ((motor.max_amps * wheelCount) > (batt.capacity_wh * 2)) warnings.push("Battery C-rating might be insufficient for peak motor draw.");
        if (maxSpeedKmh > 50 && chassisId === 'chassis_aion') warnings.push("High speed on heavy chassis reduces cornering stability.");

        return {
            chassis, motor, wheel, batt, cameraPayload,
            stats: {
                totalWeight,
                massChassis,
                massMotors,
                massWheels,
                massBatt,
                massCamera,
                massArmor,
                maxSpeedKmh,
                maxIncline,
                estRangeKm,
                avgDrawWatts,
                runTimeHours,
                flightTimeMin,
                usableWh,
                cruisingSpeedKmh,
                wheelTorque
            },
            warnings
        };
    }, [chassisId, motorId, wheelId, battId, cameraId, payloadMass, wheelCount, hasArmorCage]);

    const getProductId = (id: string) =>
        `local_${id}_${Math.abs(id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0))}`;

    const handleGenerateBOM = async () => {
        try {
            const chassisPid = getProductId(chassisId);
            await addToCart(chassisPid, 1, { id: chassisPid, name: derived.chassis.name, base_price: derived.chassis.price, platform_pill: 'rover', phase: 'drone' });

            const motorPid = getProductId(motorId);
            await addToCart(motorPid, wheelCount, { id: motorPid, name: derived.motor.name, base_price: derived.motor.price, category: 'propulsion', platform_pill: 'rover', phase: 'drone' });

            const wheelPid = getProductId(wheelId);
            await addToCart(wheelPid, wheelCount, { id: wheelPid, name: derived.wheel.name, base_price: derived.wheel.price, platform_pill: 'rover', phase: 'drone' });

            const battPid = getProductId(battId);
            await addToCart(battPid, 1, { id: battPid, name: derived.batt.name, base_price: derived.batt.price, category: 'batteries', platform_pill: 'rover', phase: 'drone' });

            if (cameraId !== 'cam_none') {
                const camPid = getProductId(cameraId);
                await addToCart(camPid, 1, { id: camPid, name: derived.cameraPayload.name, base_price: derived.cameraPayload.price, power_draw_w: 15, segment: 'rover', platform_pill: 'rover', phase: 'drone' });
            }

            if (edgeDeviceId) {
                const edgeProduct = products.find(p => p.id.toString() === edgeDeviceId);
                await addToCart(edgeDeviceId, 1, { 
                    id: edgeDeviceId, 
                    name: edgeProduct ? edgeProduct.name : 'SKHY Resilient Edge', 
                    base_price: edgeProduct ? edgeProduct.base_price : 1800, 
                    power_draw_w: edgeProduct ? edgeProduct.power_draw_w : 25, 
                    segment: 'rover',
                    platform_pill: 'rover', 
                    phase: 'drone' 
                });
            }

            setCartOpen(true);
        } catch (error) {
            console.error("Failed to generate BOM:", error);
        }
    };

    return {
        state: { isLoading, loadingProgress, chassisId, motorId, wheelId, battId, cameraId, payloadMass, wheelCount, hasArmorCage, edgeDeviceId, templateId, calcVisible },
        controls: { setChassisId, setMotorId, setWheelId, setBattId, setCameraId, setPayloadMass, setWheelCount, setHasArmorCage, setEdgeDeviceId, setTemplateId, setCalcVisible, handleGenerateBOM },
        derived
    };
}

// ==========================================
// 3. LOGIC BREAKDOWN COMPONENT
// ==========================================

interface RowProps {
    label: string;
    value: string | number;
    unit?: string;
    highlight?: 'sky' | 'amber' | 'emerald' | 'purple' | 'red';
}

const Row = ({ label, value, unit, highlight }: RowProps) => {
    const colorMap: Record<string, string> = {
        sky: 'text-sky-400',
        amber: 'text-amber-400',
        emerald: 'text-emerald-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
    };
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400">{label}</span>
            <span className={`text-[11px] font-bold font-mono ${highlight ? colorMap[highlight] : 'text-white'}`}>
                {value}{unit ? <span className="text-[9px] text-slate-500 ml-0.5">{unit}</span> : null}
            </span>
        </div>
    );
};

const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
    <div className="bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden mb-2">
        <div className={`px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5 ${color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
        </div>
        <div className="p-3 space-y-1.5">{children}</div>
    </div>
);

interface RoverPayloadRangeLogicProps {
    derived: any;
    payloadMass: number;
    wheelCount: number;
    hasArmorCage: boolean;
    onClose: () => void;
}

const RoverPayloadRangeLogic = ({ derived, payloadMass, wheelCount, hasArmorCage, onClose }: RoverPayloadRangeLogicProps) => {
    const { stats, cameraPayload } = derived;

    return (
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 mb-6">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between cursor-pointer" onClick={onClose}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-500/10 rounded-lg">
                        <Calculator className="w-4 h-4 text-sky-400" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Logic Breakdown</h3>
                </div>
                <button className="text-slate-500 hover:text-slate-300">
                    <ChevronUp className="w-4 h-4" />
                </button>
            </div>

            <div className="p-3">
                {/* Mass Budget */}
                <Section title="âš– Mass Budget" color="text-sky-400">
                    <Row label="Base Chassis" value={stats.massChassis.toFixed(2)} unit="kg" />
                    <Row label={`Drivetrain Motors (x${wheelCount})`} value={stats.massMotors.toFixed(2)} unit="kg" />
                    <Row label={`Track System (x${wheelCount})`} value={stats.massWheels.toFixed(2)} unit="kg" />
                    <Row label="Energy Cell" value={stats.massBatt.toFixed(2)} unit="kg" />
                    {hasArmorCage && <Row label="Anti-Drone Slat Armor" value={stats.massArmor.toFixed(2)} unit="kg" highlight="amber" />}
                    {cameraPayload.id !== 'cam_none' && <Row label="Optics/Sensors" value={stats.massCamera.toFixed(2)} unit="kg" highlight="amber" />}
                    <Row label="Mission Cargo (Misc)" value={payloadMass.toFixed(2)} unit="kg" highlight="amber" />
                    <div className="border-t border-slate-700 pt-1 mt-1">
                        <Row label="Total AUW (Weight)" value={stats.totalWeight.toFixed(2)} unit="kg" highlight="sky" />
                    </div>
                </Section>

                {/* Power & Traction */}
                <Section title="âš¡ Power & Traction" color="text-purple-400">
                    <Row label="Total Torque (Post-Gear)" value={stats.wheelTorque.toFixed(1)} unit=" Nm" highlight="purple" />
                    <Row label="Calculated Max Incline" value={stats.maxIncline.toFixed(1)} unit="Â°" />
                    <Row label="Mobility Power Draw" value={Math.round(stats.avgDrawWatts).toString()} unit=" W" />
                    <Row label="Usable Battery (80% DOD)" value={stats.usableWh.toFixed(1)} unit=" Wh" />
                    <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500 leading-relaxed">
                        P = AUW({stats.totalWeight.toFixed(1)}kg) Ã— 3.5W/kg = {Math.round(stats.avgDrawWatts)}W
                        <br />
                        T = (Motor_Nm Ã— {wheelCount}) Ã— GearRatio Ã— 0.85
                    </div>
                </Section>

                {/* Range */}
                <Section title="ðŸ“¡ Range Estimate" color="text-emerald-400">
                    <Row label="Cruising Speed (50%)" value={stats.cruisingSpeedKmh.toFixed(1)} unit=" km/h" />
                    <Row label="Endurance Runtime" value={stats.flightTimeMin.toFixed(0)} unit=" min" />
                    <Row label="Projected Range" value={stats.estRangeKm.toFixed(1)} unit=" km" highlight="emerald" />
                    <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500 leading-relaxed">
                        t = {stats.usableWh.toFixed(1)}Wh / {Math.round(stats.avgDrawWatts)}W Ã— 60 = {stats.flightTimeMin.toFixed(0)} min
                        <br />
                        R = {stats.cruisingSpeedKmh.toFixed(1)} km/h Ã— {(stats.flightTimeMin / 60).toFixed(2)} h = {stats.estRangeKm.toFixed(1)} km
                    </div>
                </Section>
            </div>
        </div>
    );
};

// ==========================================
// 4. THREE.JS CANVAS COMPONENT
// ==========================================

interface Rover3DViewerProps {
    chassis: any;
    wheel: any;
    motor: any;
    cameraPayload: any;
    wheelCount: number;
    hasArmorCage: boolean;
}

const Rover3DViewer = ({ chassis, wheel, motor, cameraPayload, wheelCount, hasArmorCage }: Rover3DViewerProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const wheelsRef = useRef<THREE.Object3D[]>([]);
    const camAssemblyRef = useRef<THREE.Group | null>(null);
    const { isNightMode } = useTheme();
    const cameraStateRef = useRef({
        spherical: new THREE.Spherical(3.5, Math.PI / 3, Math.PI * 0.8),
        target: new THREE.Vector3(0, 0, 0)
    });

    useEffect(() => {
        if (!mountRef.current) return;

        // Init Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(isNightMode ? 0x0f172a : 0xfef3c7);
        scene.fog = new THREE.Fog(isNightMode ? 0x0f172a : 0xfde68a, 2, 12);

        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
        camera.position.set(2.2, 1.8, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // Brightened Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
        scene.add(hemiLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        // Ground Grid
        const gridHelper = new THREE.GridHelper(20, 40, isNightMode ? 0x38bdf8 : 0xfcd34d, isNightMode ? 0x1e293b : 0xfef3c7);
        gridHelper.position.y = -wheel.radius;
        scene.add(gridHelper);

        // Build Rover Group
        const roverGroup = new THREE.Group();
        scene.add(roverGroup);

        const [cw, ch, cd] = chassis.size;

        // 1. Detailed Chassis
        const chassisGroup = new THREE.Group();
        chassisGroup.position.y = wheel.radius + ch / 2 + 0.02; // Sits above axles
        roverGroup.add(chassisGroup);

        // Main deck
        const deckGeo = new THREE.BoxGeometry(cw, ch * 0.5, cd);
        const deckMat = new THREE.MeshPhysicalMaterial({
            color: chassis.color, metalness: 0.6, roughness: 0.4, clearcoat: 0.3
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.castShadow = true;
        chassisGroup.add(deck);

        // Top Cabin / Electronics Box
        const cabinGeo = new THREE.BoxGeometry(cw * 0.5, ch * 0.8, cd * 0.6);
        const cabinMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a2228, metalness: 0.8, roughness: 0.5
        });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(cw * 0.1, ch * 0.65, 0);
        cabin.castShadow = true;
        chassisGroup.add(cabin);

        // --- CAMERA ASSEMBLY ---
        if (cameraPayload.id !== "cam_none") {
            const camGroup = new THREE.Group();
            const scale = 0.5 + (cameraPayload.weight_kg / 8);

            // Camera Base/Mast
            const mastGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.15 * scale, 12);
            const mastMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.4 });
            const mast = new THREE.Mesh(mastGeo, mastMat);
            mast.position.y = (0.15 * scale) / 2;
            camGroup.add(mast);

            // Camera Sensor Head
            const headGeo = new THREE.SphereGeometry(0.08 * scale, 16, 16);
            const headMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.y = (0.15 * scale) + (0.08 * scale);
            camGroup.add(head);

            // Primary Lens
            const lensGeo = new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.05 * scale, 16);
            lensGeo.rotateX(Math.PI / 2);
            const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 });
            const lens = new THREE.Mesh(lensGeo, lensMat);
            lens.position.set(0, head.position.y, 0.07 * scale);
            camGroup.add(lens);

            // Secondary Sensor
            if (cameraPayload.weight_kg > 2.0) {
                const subLensGeo = new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 0.04 * scale, 12);
                subLensGeo.rotateX(Math.PI / 2);
                const subLensMat = new THREE.MeshPhysicalMaterial({ color: 0x220000, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 });
                const subLens = new THREE.Mesh(subLensGeo, subLensMat);
                subLens.position.set(0.04 * scale, head.position.y + (0.03 * scale), 0.07 * scale);
                camGroup.add(subLens);
            }

            // Mount on/in the payload box
            camGroup.position.set(-cw * 0.15, ch + 0.125, 0);
            camGroup.castShadow = true;
            chassisGroup.add(camGroup);

            camAssemblyRef.current = camGroup;
        }

        // Front Bumper
        const bumperGeo = new THREE.BoxGeometry(cw * 0.05, ch * 0.4, cd * 1.05);
        const bumperMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.8 });
        const bumper = new THREE.Mesh(bumperGeo, bumperMat);
        bumper.position.set(-(cw / 2) - 0.025, 0, 0);
        chassisGroup.add(bumper);

        // Optional Anti-Drone Armor Cage
        if (hasArmorCage) {
            const cageH = ch * 2.5;
            const cageGeo = new THREE.CylinderGeometry(cw * 0.85, cw * 0.5, cageH, 4, 3, true);
            cageGeo.rotateY(Math.PI / 4);
            cageGeo.scale(1, 1, cd / cw);

            const cageMat = new THREE.MeshStandardMaterial({
                color: 0x4a5d4a,
                wireframe: true,
                metalness: 0.8,
                roughness: 0.5
            });

            const cageMesh = new THREE.Mesh(cageGeo, cageMat);
            cageMesh.position.set(0, (ch * 0.25) + (cageH / 2), 0);
            chassisGroup.add(cageMesh);

            const roofWidth = (cw * 0.85 * Math.cos(Math.PI / 4)) * 2;
            const roofDepth = roofWidth * (cd / cw);

            const roofGeo = new THREE.PlaneGeometry(roofWidth, roofDepth, 4, 4);
            roofGeo.rotateX(-Math.PI / 2);

            const roofMesh = new THREE.Mesh(roofGeo, cageMat);
            roofMesh.position.set(0, (ch * 0.25) + cageH, 0);
            chassisGroup.add(roofMesh);
        }

        // 2. Payload Box (Solid Crate)
        const payloadGeo = new THREE.BoxGeometry(cw * 0.35, 0.15, cd * 0.5);
        const payloadMat = new THREE.MeshStandardMaterial({
            color: 0x2d3748,
            roughness: 0.9,
            metalness: 0.1
        });
        const payloadMesh = new THREE.Mesh(payloadGeo, payloadMat);
        payloadMesh.position.set(-cw * 0.15, ch + 0.05, 0);
        payloadMesh.castShadow = true;
        chassisGroup.add(payloadMesh);

        // --- CONTINUOUS CHAIN TRACKS & ROAD WHEELS ---
        wheelsRef.current = [];
        const axleGeo = new THREE.CylinderGeometry(0.015, 0.015, cd + 0.04, 8);
        axleGeo.rotateX(Math.PI / 2);
        const axleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });

        const frontAxleX = -(cw / 2) + 0.15;
        const midAxleX = 0;
        const rearAxleX = (cw / 2) - 0.15;
        const axleY = wheel.radius;

        const frontAxle = new THREE.Mesh(axleGeo, axleMat);
        frontAxle.position.set(frontAxleX, axleY, 0);
        roverGroup.add(frontAxle);

        if (wheelCount === 6) {
            const midAxle = new THREE.Mesh(axleGeo, axleMat);
            midAxle.position.set(midAxleX, axleY, 0);
            roverGroup.add(midAxle);
        }

        const rearAxle = new THREE.Mesh(axleGeo, axleMat);
        rearAxle.position.set(rearAxleX, axleY, 0);
        roverGroup.add(rearAxle);

        // Generate Track Texture
        const tCanvas = document.createElement('canvas');
        tCanvas.width = 64; tCanvas.height = 64;
        const ctx = tCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#222'; ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#444'; ctx.fillRect(0, 0, 32, 64);
        }
        const trackTex = new THREE.CanvasTexture(tCanvas);
        trackTex.wrapS = THREE.RepeatWrapping;
        trackTex.wrapT = THREE.RepeatWrapping;
        trackTex.repeat.set(40, 40);

        // Track Geometry
        const trackShape = new THREE.Shape();
        trackShape.moveTo(frontAxleX, axleY + wheel.radius);
        trackShape.lineTo(rearAxleX, axleY + wheel.radius);
        trackShape.absarc(rearAxleX, axleY, wheel.radius, Math.PI / 2, -Math.PI / 2, true);
        trackShape.lineTo(frontAxleX, axleY - wheel.radius);
        trackShape.absarc(frontAxleX, axleY, wheel.radius, -Math.PI / 2, Math.PI / 2, true);

        const trackGeo = new THREE.ExtrudeGeometry(trackShape, {
            depth: wheel.width * 1.2,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.005,
            bevelThickness: 0.005
        });

        const trackMat = new THREE.MeshStandardMaterial({
            map: trackTex, color: wheel.color, roughness: 0.8, metalness: 0.3
        });

        const wheelZOffset = (cd / 2) + (wheel.width / 2) + 0.02;

        const trackLeft = new THREE.Mesh(trackGeo, trackMat);
        trackLeft.position.z = wheelZOffset - (wheel.width * 0.6);
        trackLeft.castShadow = true;
        roverGroup.add(trackLeft);

        const trackRight = new THREE.Mesh(trackGeo, trackMat);
        trackRight.position.z = -wheelZOffset - (wheel.width * 0.6);
        trackRight.castShadow = true;
        roverGroup.add(trackRight);

        // Road Wheels
        const createSprocketGroup = () => {
            const group = new THREE.Group();
            const rimGeo = new THREE.CylinderGeometry(wheel.radius * 0.8, wheel.radius * 0.8, wheel.width * 0.8, 12);
            rimGeo.rotateX(Math.PI / 2);
            const rimMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.2, wireframe: true });
            const rim = new THREE.Mesh(rimGeo, rimMat);
            group.add(rim);

            const hubGeo = new THREE.CylinderGeometry(wheel.radius * 0.25, wheel.radius * 0.25, wheel.width * 0.9, 16);
            hubGeo.rotateX(Math.PI / 2);
            const hubMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.1 });
            const hub = new THREE.Mesh(hubGeo, hubMat);
            group.add(hub);
            return group;
        };

        const wheelPositions = [
            [frontAxleX, axleY, wheelZOffset],
            [frontAxleX, axleY, -wheelZOffset],
            [rearAxleX, axleY, wheelZOffset],
            [rearAxleX, axleY, -wheelZOffset],
        ];

        if (wheelCount === 6) {
            wheelPositions.push(
                [midAxleX, axleY, wheelZOffset],
                [midAxleX, axleY, -wheelZOffset]
            );
        }

        wheelPositions.forEach((pos) => {
            const wGroup = createSprocketGroup();
            wGroup.position.set(pos[0], pos[1], pos[2]);
            roverGroup.add(wGroup);
            wheelsRef.current.push(wGroup);
        });

        // Mouse Controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        const { spherical, target } = cameraStateRef.current;

        const onMouseDown = () => { isDragging = true; };
        const onMouseUp = () => { isDragging = false; };
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
                
                if (e.shiftKey || e.button === 1) {
                    const panSpeed = spherical.radius * 0.002;
                    const forward = new THREE.Vector3().subVectors(target, camera.position).setY(0).normalize();
                    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
                    target.addScaledVector(right, -deltaMove.x * panSpeed);
                    target.addScaledVector(forward, deltaMove.y * panSpeed);
                } else {
                    spherical.theta -= deltaMove.x * 0.01;
                    spherical.phi -= deltaMove.y * 0.01;
                    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
                }
            }
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        };
        const onWheel = (e: WheelEvent) => {
            spherical.radius += e.deltaY * 0.005;
            spherical.radius = Math.max(1.5, Math.min(10, spherical.radius));
        };

        const canvasEl = mountRef.current;
        canvasEl.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        canvasEl.addEventListener('mousemove', onMouseMove);
        canvasEl.addEventListener('wheel', onWheel, { passive: true });

        // Animation
        let frameId: number;
        let time = 0;
        const animate = () => {
            time += 0.01;
            frameId = requestAnimationFrame(animate);
            camera.position.setFromSpherical(spherical);
            camera.lookAt(target);

            const spinSpeed = motor.kv > 2000 ? 0.1 : 0.03;
            wheelsRef.current.forEach(w => w.rotation.z += spinSpeed);
            trackTex.offset.x -= spinSpeed * 0.2;
            trackTex.offset.y -= spinSpeed * 0.2;
            gridHelper.position.x = (time * spinSpeed * 20) % 0.5;

            // Pan the camera side to side as it scans
            if (camAssemblyRef.current) {
                camAssemblyRef.current.rotation.y = Math.sin(time) * 0.5;
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current || !rendererRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            rendererRef.current.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mouseup', onMouseUp);
            if (canvasEl) {
                canvasEl.removeEventListener('mousedown', onMouseDown);
                canvasEl.removeEventListener('mousemove', onMouseMove);
                canvasEl.removeEventListener('wheel', onWheel);
            }
            cancelAnimationFrame(frameId);
            if (mountRef.current && rendererRef.current) mountRef.current.removeChild(rendererRef.current.domElement);
            if (rendererRef.current) rendererRef.current.dispose();
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) object.material.forEach((m: THREE.Material) => m.dispose());
                            else object.material.dispose();
                        }
                    }
                });
            }
        };
    }, [chassis, wheel, motor, cameraPayload, wheelCount, hasArmorCage, isNightMode]);

    const zoom = (factor: number) => {
        const { spherical } = cameraStateRef.current;
        const speed = spherical.radius * 0.2;
        spherical.radius = Math.max(1.5, Math.min(10, spherical.radius + (factor * speed)));
    };

    const reset = () => {
        const { spherical, target } = cameraStateRef.current;
        spherical.set(3.5, Math.PI / 3, Math.PI * 0.8);
        target.set(0, 0, 0);
    };

    return (
        <div className="absolute inset-0 z-0 group">
            <div ref={mountRef} className="w-full h-full cursor-move" />

            {/* Navigation Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="flex flex-col bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                    <button 
                        onClick={() => zoom(-1)} 
                        className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-b border-slate-800" 
                        title="Zoom In"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => zoom(1)} 
                        className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-b border-slate-800" 
                        title="Zoom Out"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={reset} 
                        className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" 
                        title="Reset View"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg shadow-xl">
                    <div className="text-[9px] text-slate-500 font-mono text-center leading-tight">
                        SHIFT+DRAG<br/>TO PAN
                    </div>
                </div>
            </div>

            <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none z-10">
                <div className="bg-slate-900/80 backdrop-blur border border-sky-500/30 p-4 rounded-xl shadow-2xl">
                    <div className="text-xs text-sky-400 font-bold tracking-widest uppercase mb-1">Live Telemetry</div>
                    <div className="flex items-center gap-3 mt-2">
                        <Settings className="text-slate-400 w-5 h-5" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase">Configuration</div>
                            <div className="text-sm text-white font-mono">
                                {wheelCount}x{wheelCount} AWD {hasArmorCage && '+ CAGE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 5. UI COMPONENTS
// ==========================================

interface LoadingOverlayProps {
    isLoading: boolean;
    progress: number;
}

const LoadingOverlay = ({ isLoading, progress }: LoadingOverlayProps) => {
    if (!isLoading) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 text-emerald-400 mb-8">
                    <Loader2 className="w-16 h-16 animate-spin" />
                    <h2 className="text-2xl font-bold uppercase tracking-widest animate-pulse text-center">Booting UGV System</h2>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ title, item, icon: Icon, extraDetail }: { title: string; item: any; icon: any; extraDetail?: string }) => {
    if (!item || item.id === 'cam_none') return null;
    return (
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 my-2 flex gap-3 animate-in fade-in slide-in-from-left-1 duration-300">
            {item.imageUrl ? (
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
                    <Icon className="w-6 h-6 text-slate-400" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">{title}</div>
                <div className="text-xs font-bold text-white truncate">{item.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                    ${item.price} â€¢ {item.weight_kg}kg {extraDetail}
                </div>
            </div>
        </div>
    );
};

interface RoverSidebarProps {
    state: any;
    controls: any;
    derived: any;
}

const RoverSidebar = ({ state, controls, derived }: RoverSidebarProps) => {
    return (
        <div className="w-1/2 h-full overflow-y-auto bg-slate-900/95 backdrop-blur border-r border-slate-700 p-6 z-10 flex-shrink-0 relative custom-scrollbar">
            <div className="mb-8">
                <div className="inline-block px-3 py-1 border-2 border-emerald-500 text-emerald-400 font-black text-2xl tracking-[3px] rounded mb-2">TERRA</div>
                <h1 className="text-lg font-bold uppercase tracking-wider text-white">UGV Rover Configurator</h1>
            </div>

            <div className="mb-6">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">Build Presets</label>
                <select value={state.templateId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => controls.setTemplateId(e.target.value)} className="w-full bg-slate-800 border-2 border-emerald-500/30 rounded p-2.5 text-sm font-bold outline-none focus:border-emerald-500 text-white">
                    <option value="">-- Custom Build --</option>
                    {Object.entries(ROVER_TEMPLATES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
                </select>
            </div>

            <div className="space-y-2 mb-6">
                {derived.warnings.map((warn: string, i: number) => (
                    <div key={i} className="bg-amber-950/50 p-3 rounded border-l-4 border-amber-500 animate-in fade-in">
                        <div className="flex items-center gap-2 text-amber-400 mb-1 font-bold text-xs"><AlertTriangle className="w-4 h-4" /> ENGINEERING WARNING</div>
                        <div className="text-xs text-amber-200">{warn}</div>
                    </div>
                ))}
            </div>

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">1. Mechanics & Drive</div>

            <label className="text-xs text-slate-300 block mb-1">Chassis Architecture</label>
            <select value={state.chassisId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setChassisId(e.target.value); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                {Object.values(CHASSIS_TYPES).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ProductCard title="Frame" item={derived.chassis} icon={CarFront} />

            <label className="text-xs text-slate-300 block mb-1 mt-4">Drive Configuration (AWD)</label>
            <select value={state.wheelCount} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setWheelCount(Number(e.target.value)); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                <option value={4}>4x4 Drive (Lighter, Less Drag)</option>
                <option value={6}>6x6 Drive (Heavy Duty, Max Traction)</option>
            </select>

            <label className="text-xs text-slate-300 block mb-1 mt-4">Anti-Drone Armor Cage (+2.5kg)</label>
            <select value={state.hasArmorCage ? "yes" : "no"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setHasArmorCage(e.target.value === "yes"); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                <option value="no">None (Standard Payload Deck)</option>
                <option value="yes">Mounted Wireframe Cage (Slat Armor)</option>
            </select>

            <label className="text-xs text-slate-300 block mb-1 mt-4">Drivetrain Motors (x{state.wheelCount})</label>
            <select value={state.motorId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setMotorId(e.target.value); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                {Object.values(MOTORS).map(m => <option key={m.id} value={m.id}>{m.name} ({m.kv}KV)</option>)}
            </select>
            <ProductCard title="Propulsion" item={derived.motor} icon={Cpu} extraDetail={`(x${state.wheelCount})`} />

            <label className="text-xs text-slate-300 block mb-1 mt-4">Track/Tire Package (x{state.wheelCount} road wheels)</label>
            <select value={state.wheelId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setWheelId(e.target.value); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                {Object.values(WHEELS).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <ProductCard title="Traction" item={derived.wheel} icon={CircleDot} extraDetail={`(x${state.wheelCount})`} />

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">2. Power Systems</div>
            <select value={state.battId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setBattId(e.target.value); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                {Object.values(BATTERIES).map(b => <option key={b.id} value={b.id}>{b.name} ({b.voltage}V)</option>)}
            </select>
            <ProductCard title="Power" item={derived.batt} icon={Battery} />

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">3. Cargo & Optics</div>

            <label className="text-xs text-slate-300 block mb-1">Optics & Sensor Payload</label>
            <select value={state.cameraId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { controls.setCameraId(e.target.value); controls.setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-emerald-500 text-white">
                {Object.values(CAMERAS).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ProductCard title="Vision System" item={derived.cameraPayload} icon={Video} extraDetail={derived.cameraPayload.range_km > 0 ? `â€¢ ${derived.cameraPayload.range_km}km Range` : ""} />

            <label className="text-xs text-slate-300 block mb-1 mt-4">Misc. Cargo Mass ({state.payloadMass} kg)</label>
            <input type="range" min="0" max="50" step="0.5" value={state.payloadMass} onChange={(e: React.ChangeEvent<HTMLInputElement>) => controls.setPayloadMass(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-emerald-500 mb-6" />

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">4. Edge Computing</div>
            <label className="text-xs text-slate-300 block mb-1">Onboard Compute (Required for Skhy Processing)</label>
            <select value={state.edgeDeviceId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => controls.setEdgeDeviceId(e.target.value)} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-4 outline-none focus:border-emerald-500 text-white">
                <option value="900009">SKHY Light Edge (Core)</option>
                <option value="900010">SKHY Resilient Edge</option>
            </select>

            {/* Performance Stats & Logic Toggle */}
            <div className="flex justify-between items-center cursor-pointer border-b border-slate-700 pb-1 mb-3 mt-8" onClick={() => controls.setCalcVisible(!state.calcVisible)}>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">4. Predicted Telemetry</div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-sky-400 bg-sky-900/50 px-2 py-0.5 rounded border border-sky-400/30 flex items-center gap-1">
                        <Calculator className="w-3 h-3" /> View Logic
                    </span>
                </div>
            </div>

            {state.calcVisible && (
                <RoverPayloadRangeLogic
                    derived={derived}
                    payloadMass={state.payloadMass}
                    wheelCount={state.wheelCount}
                    hasArmorCage={state.hasArmorCage}
                    onClose={() => controls.setCalcVisible(false)}
                />
            )}

            <div className="grid grid-cols-2 gap-2 mb-8 mt-4">
                <div className="bg-slate-800 p-3 rounded border-l-4 border-slate-400">
                    <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1"><Weight className="w-3 h-3" /> Total Weight</span>
                    <span className="text-lg font-bold text-white">{derived.stats.totalWeight.toFixed(1)} kg</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border-l-4 border-emerald-500">
                    <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1"><Gauge className="w-3 h-3" /> Top Speed</span>
                    <span className="text-lg font-bold text-emerald-400">{derived.stats.maxSpeedKmh.toFixed(1)} km/h</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border-l-4 border-amber-500">
                    <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Climb Angle</span>
                    <span className="text-lg font-bold text-amber-400">{derived.stats.maxIncline.toFixed(0)}Â°</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border-l-4 border-sky-400">
                    <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1"><Battery className="w-3 h-3" /> Est. Range</span>
                    <span className="text-lg font-bold text-sky-400">{derived.stats.estRangeKm.toFixed(1)} km</span>
                </div>
            </div>

            <button onClick={controls.handleGenerateBOM} className="w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 mb-4">
                <ShoppingCart className="w-5 h-5 mr-2" /> Save Configuration to Build
            </button>
        </div>
    );
};

// 6. MAIN APPLICATION
// ==========================================

export default function RoverSimulator() {
    const { state, controls, derived } = useRoverSimulation();
    const { isNightMode } = useTheme();

    return (
        <div className={`${isNightMode ? 'bg-slate-900' : 'bg-[#fef3c7]'} text-slate-200 h-full w-full overflow-hidden flex relative font-sans`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}} />

            <LoadingOverlay isLoading={state.isLoading} progress={state.loadingProgress} />

            <div className="flex-1 flex relative">
                <RoverSidebar state={state} controls={controls} derived={derived} />

                <div className={`w-1/2 h-full relative ${isNightMode ? 'bg-slate-950' : 'bg-[#fef3c7]'}`}>
                    {!state.isLoading && (
                        <Rover3DViewer
                            chassis={derived.chassis}
                            wheel={derived.wheel}
                            motor={derived.motor}
                            cameraPayload={derived.cameraPayload}
                            wheelCount={state.wheelCount}
                            hasArmorCage={state.hasArmorCage}
                        />
                    )}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-0" />
                </div>
            </div>
        </div>
    );
}

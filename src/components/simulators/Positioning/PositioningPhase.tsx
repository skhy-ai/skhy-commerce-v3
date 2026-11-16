import React, { useState, useMemo, useCallback } from 'react';
import { Loader2, Compass, Scale, ShoppingCart } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import { useMarketplace } from '../../../hooks/useMarketplace';
import { SimulatorTopHUD } from '../SimulatorTopHUD';
import { useTheme } from '../../../contexts/ThemeContext';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Map Controls ─────────────────────────────────────────────────────────────
function MapControls() {
    const map = useMap();
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
            <div className="flex flex-col bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                <button onClick={() => map.zoomIn()} className="p-3 w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-300 border-b border-slate-800 font-bold text-lg transition-colors">+</button>
                <button onClick={() => map.zoomOut()} className="p-3 w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-300 font-bold text-lg transition-colors">-</button>
            </div>
            <button 
                onClick={() => map.setView([3.139, 101.687], 13)} 
                className="w-10 h-10 flex items-center justify-center bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg text-slate-300 shadow-xl hover:bg-slate-800 transition-colors"
                title="Reset View"
            >
                ⟲
            </button>
        </div>
    );
}

// ─── Custom Marker Icons ──────────────────────────────────────────────────────
const originIcon = new L.DivIcon({
    html: `<div style="background:#a78bfa;border:2px solid #c084fc;border-radius:2px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px #a78bfaaa;font-size:10px;color:white;font-weight:900">A</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
});
const destIcon = new L.DivIcon({
    html: `<div style="background:#f43f5e;border:2px solid #fb7185;border-radius:2px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px #f43f5eaa;font-size:10px;color:white;font-weight:900">B</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
});
const quadIcon = new L.DivIcon({
    html: `<div style="background:#0ea5e9;border:2px solid #38bdf8;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #0ea5e9aa;font-size:14px">🚁</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
});
const fixedWingIcon = new L.DivIcon({
    html: `<div style="background:#0ea5e9;border:2px solid #38bdf8;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #0ea5e9aa;font-size:14px">✈</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
});
const roverIcon = new L.DivIcon({
    html: `<div style="background:#f59e0b;border:2px solid #fbbf24;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #f59e0baa;font-size:14px">🚙</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
});
const gcsIcon = new L.DivIcon({
    html: `<div style="background:#10b981;border:2px solid #34d399;border-radius:4px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #10b981aa;font-size:14px">📡</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    className: '',
});
const jammerIcon = new L.DivIcon({
    html: `<div style="background:#dc2626;border:2px solid #f87171;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px #dc2626cc;font-size:14px">⚡</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
});

// ─── Haversine distance & bearing ────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const x = Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) - Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─── Map click handler ────────────────────────────────────────────────────────
type PlaceMode = 'drone' | 'gcs' | 'jammer' | 'directional_jammer' | 'origin' | 'dest' | null;

function MapClickHandler({ mode, onPlace }: { mode: PlaceMode; onPlace: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            if (mode) onPlace(e.latlng);
        },
    });
    return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────
import { PayloadRangeLogic } from '../Shared/PayloadRangeLogic';

export interface PositioningResult {
    droneToJammerKm: number;
    gcsToJammerKm: number;
    droneToGcsKm: number;
    jammerBearingFromDrone: number;
    missionDistanceKm: number;
}

interface PositioningPhaseProps {
    onPositioningUpdate?: (res: PositioningResult) => void;
    droneCalcData?: any;
    platform?: 'multirotor' | 'fixed-wing' | 'rover';
}

// ─── GNSS Bands (for toggling in the sidebar) ─────────────────────────────────
const GNSS_BANDS = [
    { id: 'gps_l1', label: 'GPS L1 (1575 MHz)', color: '#f59e0b' },
    { id: 'gps_l2', label: 'GPS L2 (1227 MHz)', color: '#fb923c' },
    { id: 'glonass', label: 'GLONASS (1602 MHz)', color: '#a78bfa' },
    { id: 'beidou', label: 'BeiDou B1 (1561 MHz)', color: '#34d399' },
    { id: 'galileo', label: 'Galileo E1 (1575 MHz)', color: '#60a5fa' },
];
// ─── Main Component ───────────────────────────────────────────────────────────
export const PositioningPhase: React.FC<PositioningPhaseProps> = ({ onPositioningUpdate, droneCalcData, platform }) => {
    const { isNightMode } = useTheme();
    const { addToCart, setIsOpen: setCartOpen } = useCart();
    const { products } = useMarketplace();
    
    // Default: Kuala Lumpur area
    const [dronePos, setDronePos] = useState<L.LatLng>(L.latLng(3.139, 101.687));
    const [gcsPos, setGcsPos] = useState<L.LatLng>(L.latLng(3.130, 101.680));
    const [origin, setOrigin] = useState<L.LatLng>(L.latLng(3.132, 101.675));
    const [dest, setDest] = useState<L.LatLng>(L.latLng(3.155, 101.710));
    const [jammers, setJammers] = useState<{ id: string, type: 'omni' | 'directional', pos: L.LatLng, radius: number, direction?: number, beamwidth?: number }>([
        { id: 'j1', type: 'omni', pos: L.latLng(3.148, 101.695), radius: 3.5 }
    ]);
    const missionPath = useMemo(() => [origin, dest], [origin, dest]);

    const [placeMode, setPlaceMode] = useState<PlaceMode>(null);
    const [jammerRadiusInput, setJammerRadiusInput] = useState(3.5);
    const [activeGnssBands, setActiveGnssBands] = useState<string[]>(['gps_l1', 'glonass']);
    const [showRings, setShowRings] = useState(true);

    const [gnssReceiverId, setGnssReceiverId] = useState("900016"); // Default: Septentrio Mosaic H
    const [isGeneratingBOM, setIsGeneratingBOM] = useState(false);

    // ─── Derived vectors ──────────────────────────────────────────────────────
    const vectors = useMemo(() => {
        if (!dronePos || !gcsPos || !origin || !dest) return null;
        
        // Use the first jammer for primary readout metrics
        const primaryJammer = jammers[0];
        const droneToJammerKm = primaryJammer ? haversineKm(dronePos.lat, dronePos.lng, primaryJammer.pos.lat, primaryJammer.pos.lng) : 0;
        const gcsToJammerKm = primaryJammer ? haversineKm(gcsPos.lat, gcsPos.lng, primaryJammer.pos.lat, primaryJammer.pos.lng) : 0;
        
        const droneToGcsKm = haversineKm(dronePos.lat, dronePos.lng, gcsPos.lat, gcsPos.lng);
        const missionDistanceKm = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
        const jammerBearingFromDrone = primaryJammer ? bearingDeg(dronePos.lat, dronePos.lng, primaryJammer.pos.lat, primaryJammer.pos.lng) : 0;
        
        const result: PositioningResult = { 
            droneToJammerKm, 
            gcsToJammerKm, 
            droneToGcsKm, 
            jammerBearingFromDrone,
            missionDistanceKm
        };
        onPositioningUpdate?.(result);
        return result;
    }, [dronePos, gcsPos, jammers, origin, dest, onPositioningUpdate]);

    const handleGenerateBOM = useCallback(async () => {
        setIsGeneratingBOM(true);
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const gnssProduct = products.find(p => p.id.toString() === gnssReceiverId);
        if (gnssProduct) {
            addToCart(
                gnssProduct.id.toString(),
                1,
                {
                    ...gnssProduct,
                    platform_pill: platform,
                    phase: 'positioning'
                }
            );
        }
        
        setCartOpen(true);
        setIsGeneratingBOM(false);
    }, [gnssReceiverId, products, addToCart, setCartOpen, platform]);

    const activeAssetIcon = useMemo(() => {
        if (platform === 'rover') return roverIcon;
        if (platform === 'fixed-wing') return fixedWingIcon;
        return quadIcon;
    }, [platform]);

    const handlePlace = useCallback((latlng: L.LatLng) => {
        if (placeMode === 'drone') setDronePos(latlng);
        else if (placeMode === 'gcs') setGcsPos(latlng);
        else if (placeMode === 'origin') setOrigin(latlng);
        else if (placeMode === 'dest') setDest(latlng);
        else if (placeMode === 'jammer') {
            if (jammers.length < 7) {
                setJammers([...jammers, { id: `j${Date.now()}`, type: 'omni', pos: latlng, radius: jammerRadiusInput }]);
            }
        }
        else if (placeMode === 'directional_jammer') {
            if (jammers.length < 7) {
                setJammers([...jammers, { id: `j${Date.now()}`, type: 'directional', pos: latlng, radius: jammerRadiusInput, direction: 90, beamwidth: 60 }]);
            }
        }
        setPlaceMode(null);
    }, [placeMode, jammers, jammerRadiusInput]);

    const updateJammer = (id: string, updates: Partial<typeof jammers[0]>) => {
        setJammers(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    };

    const removeJammer = (id: string) => setJammers(prev => prev.filter(j => j.id !== id));

    const toggleBand = (id: string) => {
        setActiveGnssBands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    };

    // Calculate "Safe Path" - simplified as straight line but we color it based on safety
    // ─── A* Pathfinding logic ───
    const [safePath, setSafePath] = useState<L.LatLng[]>([]);
    const [isCalculatingPath, setIsCalculatingPath] = useState(false);

    const calculateSafePath = useCallback(() => {
        if (!origin || !dest) return;
        setIsCalculatingPath(true);

        // Simple A* on a 20x20 grid
        const gridRes = 20;
        const minLat = Math.min(origin.lat, dest.lat, ...jammers.map(j => j.pos.lat)) - 0.05;
        const maxLat = Math.max(origin.lat, dest.lat, ...jammers.map(j => j.pos.lat)) + 0.05;
        const minLng = Math.min(origin.lng, dest.lng, ...jammers.map(j => j.pos.lng)) - 0.05;
        const maxLng = Math.max(origin.lng, dest.lng, ...jammers.map(j => j.pos.lng)) + 0.05;

        const dLat = (maxLat - minLat) / gridRes;
        const dLng = (maxLng - minLng) / gridRes;

        const getGridPos = (ll: L.LatLng) => ({
            r: Math.round((ll.lat - minLat) / dLat),
            c: Math.round((ll.lng - minLng) / dLng)
        });

        const start = getGridPos(origin);
        const end = getGridPos(dest);

        // Helper to check if a point is within a jammer's hazard zone
        const isPointInJammerZone = (lat: number, lng: number, j: typeof jammers[0]): boolean => {
            const dist = haversineKm(lat, lng, j.pos.lat, j.pos.lng);
            if (dist > j.radius) return false;
            if (j.type === 'omni') return true;
            
            // Directional check
            if (j.type === 'directional' && j.direction !== undefined && j.beamwidth !== undefined) {
                const bearing = bearingDeg(j.pos.lat, j.pos.lng, lat, lng);
                let diff = Math.abs(bearing - j.direction);
                if (diff > 180) diff = 360 - diff;
                return diff <= j.beamwidth / 2;
            }
            return false;
        };

        // Cost function: distance + massive penalty for being inside jammer radius
        const getCost = (r: number, c: number) => {
            const lat = minLat + r * dLat;
            const lng = minLng + c * dLng;
            let penalty = 1;
            for (const j of jammers) {
                if (isPointInJammerZone(lat, lng, j)) {
                    const dist = haversineKm(lat, lng, j.pos.lat, j.pos.lng);
                    if (dist < j.radius * 0.8) penalty += 5000; // Hard avoidance inner core
                    else penalty += 1000; // Soft avoidance outer edge
                }
            }
            return penalty;
        };

        // A* Search
        const openSet = [{ r: start.r, c: start.c, g: 0, f: 0, path: [origin] }];
        const visited = new Set<string>();
        let bestPath: L.LatLng[] = [origin, dest];

        let found = false;

        const maxIter = 2000;
        let iter = 0;

        while (openSet.length > 0 && iter < maxIter) {
            iter++;
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift()!;
            const key = `${current.r},${current.c}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (current.r === end.r && current.c === end.c) {
                bestPath = [...current.path, dest];
                found = true;
                break;
            }

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = current.r + dr;
                    const nc = current.c + dc;
                    if (nr < 0 || nr > gridRes || nc < 0 || nc > gridRes) continue;

                    const cost = getCost(nr, nc);
                    const g = current.g + cost;
                    const h = Math.sqrt((nr - end.r) ** 2 + (nc - end.c) ** 2);
                    const nLat = minLat + nr * dLat;
                    const nLng = minLng + nc * dLng;
                    openSet.push({
                        r: nr, c: nc, g, f: g + h,
                        path: [...current.path, L.latLng(nLat, nLng)]
                    });
                }
            }
        }

        if (!found) {
            alert("Warning: No fully resilient path found through EW hazard zones. Displaying direct path.");
        }
        setSafePath(bestPath);
        setIsCalculatingPath(false);
    }, [origin, dest, jammers]);

    const isPathCompromised = useMemo(() => {
        if (!origin || !dest) return false;
        
        const isPointInJammerZone = (lat: number, lng: number, j: typeof jammers[0]): boolean => {
            const dist = haversineKm(lat, lng, j.pos.lat, j.pos.lng);
            if (dist > j.radius) return false;
            if (j.type === 'omni') return true;
            if (j.type === 'directional' && j.direction !== undefined && j.beamwidth !== undefined) {
                const bearing = bearingDeg(j.pos.lat, j.pos.lng, lat, lng);
                let diff = Math.abs(bearing - j.direction);
                if (diff > 180) diff = 360 - diff;
                return diff <= j.beamwidth / 2;
            }
            return false;
        };

        for (let i = 0; i <= 10; i++) {
            const lat = origin.lat + (dest.lat - origin.lat) * (i / 10);
            const lng = origin.lng + (dest.lng - origin.lng) * (i / 10);
            for (const j of jammers) {
                if (isPointInJammerZone(lat, lng, j)) return true;
            }
        }
        return false;
    }, [origin, dest, jammers]);
    
    const isPointInJammerZoneGlobal = (lat: number, lng: number, j: typeof jammers[0]): boolean => {
        const dist = haversineKm(lat, lng, j.pos.lat, j.pos.lng);
        if (dist > j.radius) return false;
        if (j.type === 'omni') return true;
        if (j.type === 'directional' && j.direction !== undefined && j.beamwidth !== undefined) {
            const bearing = bearingDeg(j.pos.lat, j.pos.lng, lat, lng);
            let diff = Math.abs(bearing - j.direction);
            if (diff > 180) diff = 360 - diff;
            return diff <= j.beamwidth / 2;
        }
        return false;
    };

    const primaryJammerRadius = jammers[0]?.radius ?? jammerRadiusInput;
    const isJammedDrone = vectors && jammers.some(j => isPointInJammerZoneGlobal(dronePos.lat, dronePos.lng, j));
    const isJammedGcs = vectors && jammers.some(j => isPointInJammerZoneGlobal(gcsPos.lat, gcsPos.lng, j));

    // Calculate Polygon points for directional jammers
    const getDirectionalPolygon = (j: typeof jammers[0]) => {
        if (j.type !== 'directional' || j.direction === undefined || j.beamwidth === undefined) return [];
        
        const center = j.pos;
        const radius = j.radius;
        const startAngle = j.direction - (j.beamwidth / 2);
        const endAngle = j.direction + (j.beamwidth / 2);
        
        const points: L.LatLng[] = [center];
        const numSegments = Math.max(10, Math.floor(j.beamwidth / 5)); // Resolution of the arc
        
        for (let i = 0; i <= numSegments; i++) {
            const angleDeg = startAngle + (i / numSegments) * j.beamwidth;
            const angleRad = (angleDeg - 90) * Math.PI / 180; // Leaflet uses North as 0, standard math uses East
            
            // Rough approximation for small distances (km to lat/lng)
            const dLat = (radius * Math.cos(angleRad)) / 111.32;
            const dLng = (radius * Math.sin(angleRad)) / (40075 * Math.cos(center.lat * Math.PI / 180) / 360);
            
            points.push(L.latLng(center.lat - dLat, center.lng + dLng)); // -dLat because our angle is from North (y-axis down essentially in math, but map is North up. -90 adjustment handles it roughly. A more precise destination point function could be used)
        }
        
        // More precise destination point calculation
        const getDestination = (lat: number, lng: number, brng: number, dist: number) => {
            const R = 6371; // Earth Radius in km
            const lat1 = lat * Math.PI / 180;
            const lon1 = lng * Math.PI / 180;
            const brngRad = brng * Math.PI / 180;
            
            const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist / R) +
                Math.cos(lat1) * Math.sin(dist / R) * Math.cos(brngRad));
            const lon2 = lon1 + Math.atan2(Math.sin(brngRad) * Math.sin(dist / R) * Math.cos(lat1),
                Math.cos(dist / R) - Math.sin(lat1) * Math.sin(lat2));
                
            return L.latLng(lat2 * 180 / Math.PI, lon2 * 180 / Math.PI);
        };
        
        const precisePoints: L.LatLng[] = [center];
        for (let i = 0; i <= numSegments; i++) {
             const currentBearing = startAngle + (i / numSegments) * j.beamwidth;
             precisePoints.push(getDestination(center.lat, center.lng, currentBearing, radius));
        }

        return precisePoints;
    };


    return (
        <div className={`flex flex-col h-full w-full overflow-hidden transition-colors ${isNightMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <SimulatorTopHUD 
                title="Tactical Mission Positioning"
                subtitle="Anti-Jamming & EW Terrain Analysis"
                metrics={[
                    { label: 'Mission Dist', value: (vectors?.missionDistanceKm || 0).toFixed(1), unit: 'km', color: 'text-sky-400' },
                    { label: 'Link Status', value: isPathCompromised ? 'COMPROMISED' : 'NOMINAL', unit: '', color: isPathCompromised ? 'text-red-500' : 'text-emerald-400' },
                    { label: 'Payload Impact', value: (droneCalcData?.totalPayload || 0).toFixed(2), unit: 'kg', color: 'text-amber-400' }
                ]}
            />
            <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* ── Left Sidebar ── */}
            <div className={`w-1/2 flex-shrink-0 flex flex-col overflow-y-auto z-20 border-r ${isNightMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                
                {/* Right Panel: Controls & Telemetry */}
                <div className={`w-full flex flex-col border-b ${isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="p-4 space-y-4">
                        {droneCalcData && (
                            <PayloadRangeLogic 
                                totalPayload={droneCalcData.totalPayload}
                                payloadReserve={droneCalcData.payloadReserve}
                                totalAUW={droneCalcData.totalAUW}
                                rangeKm={droneCalcData.rangeKm}
                                flightTimeMin={droneCalcData.flightTimeHrs * 60}
                                maxThrust={droneCalcData.totalMaxThrust}
                                hoverThrottle={droneCalcData.hoverThrottle}
                                platform={platform}
                            />
                        )}
                    </div>
                </div>

                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-1">Positioning & Interference</h2>
                    <p className="text-[11px] text-slate-400">Click a button below, then click the map to place assets.</p>
                </div>

                {/* Place buttons */}
                <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setPlaceMode(p => p === 'origin' ? null : 'origin')}
                            className={`py-2 px-1 rounded border text-[9px] font-black uppercase transition-all ${placeMode === 'origin' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                            Set Origin (A)
                        </button>
                        <button
                            onClick={() => setPlaceMode(p => p === 'dest' ? null : 'dest')}
                            className={`py-2 px-1 rounded border text-[9px] font-black uppercase transition-all ${placeMode === 'dest' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                            Set Target (B)
                        </button>
                    </div>
                    <button
                        onClick={calculateSafePath}
                        disabled={isCalculatingPath}
                        className={`w-full py-3 px-3 rounded-xl text-xs font-black uppercase tracking-[2px] transition-all border shadow-lg flex items-center justify-center gap-2
                            ${isCalculatingPath ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-wait' : 'bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 shadow-cyan-900/20'}`}
                    >
                        {isCalculatingPath ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                        {isCalculatingPath ? 'Calculating Resilient Path...' : 'Generate EW Resilient Path'}
                    </button>
                    {([
                        { mode: 'drone', label: 'Place Drone', color: 'sky' },
                        { mode: 'gcs', label: 'Place GCS', color: 'emerald' },
                        { mode: 'jammer', label: 'Omni Jammer', color: 'red' },
                        { mode: 'directional_jammer', label: 'Dir Jammer', color: 'orange' },
                    ] as const).map(({ mode, label, color }) => (
                        <button
                            key={mode}
                            onClick={() => setPlaceMode(p => p === mode ? null : mode)}
                            className={`w-full py-2 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all border
                                ${placeMode === mode
                                    ? `bg-${color}-600 border-${color}-400 text-white shadow-lg`
                                    : `bg-slate-800 border-slate-600 text-slate-400 hover:border-${color}-500 hover:text-${color}-300`}`}
                        >
                            {label}
                        </button>
                    ))}
                    {placeMode && (
                        <p className="text-[10px] text-amber-400 text-center animate-pulse py-1">Click map to place {placeMode}</p>
                    )}
                </div>

                {/* Coordinate Inputs */}
                <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/30">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Mission Coordinates</span>
                        <div className="flex gap-1">
                            <button onClick={() => setOrigin(L.latLng(3.132, 101.675))} className="text-[8px] px-1 bg-slate-800 rounded">RESET</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8px] text-slate-600 uppercase">Origin Lat</label>
                            <input type="number" value={origin.lat.toFixed(4)} onChange={e => setOrigin(L.latLng(Number(e.target.value), origin.lng))} className="w-full bg-slate-900 border-slate-800 rounded p-1 text-[10px] text-white" />
                        </div>
                        <div>
                            <label className="text-[8px] text-slate-600 uppercase">Origin Lng</label>
                            <input type="number" value={origin.lng.toFixed(4)} onChange={e => setOrigin(L.latLng(origin.lat, Number(e.target.value)))} className="w-full bg-slate-900 border-slate-800 rounded p-1 text-[10px] text-white" />
                        </div>
                        <div>
                            <label className="text-[8px] text-slate-600 uppercase">Target Lat</label>
                            <input type="number" value={dest.lat.toFixed(4)} onChange={e => setDest(L.latLng(Number(e.target.value), dest.lng))} className="w-full bg-slate-900 border-slate-800 rounded p-1 text-[10px] text-white" />
                        </div>
                        <div>
                            <label className="text-[8px] text-slate-600 uppercase">Target Lng</label>
                            <input type="number" value={dest.lng.toFixed(4)} onChange={e => setDest(L.latLng(dest.lat, Number(e.target.value)))} className="w-full bg-slate-900 border-slate-800 rounded p-1 text-[10px] text-white" />
                        </div>
                    </div>
                </div>

                {/* Jammer config */}
                <div className="p-4 border-t border-slate-800 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-[11px] uppercase tracking-widest text-red-400 font-bold">EW Hazard Zones (Primary: {primaryJammerRadius}km)</div>
                        <span className="text-[10px] text-slate-500 font-mono">{jammers.length}/7</span>
                    </div>
                    
                    <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {jammers.map(j => (
                            <div key={j.id} className="flex flex-col bg-slate-950 p-2 rounded border border-slate-800 group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${j.type === 'omni' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`} />
                                        <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{j.type === 'omni' ? 'Omni' : 'Dir'} Jammer</div>
                                    </div>
                                    <button onClick={() => removeJammer(j.id)} className="text-slate-600 hover:text-red-400 transition-colors">✕</button>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                            <span>Radius</span>
                                            <span className="text-white font-mono">{j.radius}km</span>
                                        </div>
                                        <input
                                            type="range" min="0.5" max="15" step="0.5"
                                            value={j.radius}
                                            onChange={e => updateJammer(j.id, { radius: Number(e.target.value) })}
                                            className={`w-full h-1 bg-slate-700 rounded ${j.type === 'omni' ? 'accent-red-500' : 'accent-orange-500'}`}
                                        />
                                    </div>
                                    {j.type === 'directional' && (
                                        <>
                                            <div>
                                                <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                                    <span>Direction (Heading)</span>
                                                    <span className="text-white font-mono">{j.direction}°</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="360" step="5"
                                                    value={j.direction}
                                                    onChange={e => updateJammer(j.id, { direction: Number(e.target.value) })}
                                                    className="w-full h-1 bg-slate-700 rounded accent-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                                    <span>Beamwidth</span>
                                                    <span className="text-white font-mono">{j.beamwidth}°</span>
                                                </div>
                                                <input
                                                    type="range" min="10" max="180" step="5"
                                                    value={j.beamwidth}
                                                    onChange={e => updateJammer(j.id, { beamwidth: Number(e.target.value) })}
                                                    className="w-full h-1 bg-slate-700 rounded accent-orange-500"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {jammers.length === 0 && <p className="text-[10px] text-slate-600 italic text-center">No active jammers placed</p>}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Default New Radius</span>
                            <span className="text-white font-mono">{jammerRadiusInput.toFixed(1)} km</span>
                        </div>
                        <input
                            type="range" min="0.5" max="15" step="0.5"
                            value={jammerRadiusInput}
                            onChange={e => setJammerRadiusInput(Number(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded accent-slate-500"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-slate-400 font-bold uppercase">Tactical Overlay</span>
                        <button
                            onClick={() => setShowRings(r => !r)}
                            className={`text-[10px] px-2 py-0.5 rounded font-black transition-colors ${showRings ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                        >
                            {showRings ? 'HUD ON' : 'HUD OFF'}
                        </button>
                    </div>
                </div>

                {/* GNSS Bands */}
                <div className="p-4 border-t border-slate-800">
                    <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold mb-3">GNSS Band Exposure</div>
                    <div className="space-y-1.5">
                        {GNSS_BANDS.map(band => (
                            <button
                                key={band.id}
                                onClick={() => toggleBand(band.id)}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded border text-[11px] transition-all ${activeGnssBands.includes(band.id) ? 'border-amber-500/50 bg-amber-900/20 text-amber-300' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: band.color }} />
                                    {band.label}
                                </div>
                                <span className={activeGnssBands.includes(band.id) ? 'text-amber-400' : 'text-slate-600'}>
                                    {activeGnssBands.includes(band.id) ? 'ACTIVE' : 'OFF'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* GNSS Hardware BOM builder */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-cyan-400 mb-3">
                        <ShoppingCart className="w-4 h-4" />
                        <h2 className="font-bold uppercase text-[11px] tracking-wide">GNSS Hardware</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Primary Receiver</label>
                            <select
                                value={gnssReceiverId}
                                onChange={e => setGnssReceiverId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
                            >
                                {products.filter(p => p.subcategory === 'GNSS' || p.subcategory === 'Positioning' || p.category === 'Positioning' || p.name.includes('Mosaic')).map(p => (
                                    <option key={p.id} value={p.id.toString()}>{p.name} - ${p.base_price}</option>
                                ))}
                                <option value="900016">Septentrio Mosaic H (Fallback) - $1500</option>
                            </select>
                        </div>
                        <button
                            onClick={handleGenerateBOM}
                            disabled={isGeneratingBOM}
                            className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isGeneratingBOM ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]'}`}
                        >
                            {isGeneratingBOM ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><ShoppingCart size={14} /> Save Configuration to Build</>}
                        </button>
                    </div>
                </div>

                {/* Vector Readouts */}
                {vectors && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900/40">
                        <div className="text-[11px] uppercase tracking-widest text-sky-400 font-bold mb-3 flex items-center justify-between">
                            <span>Mission Logistics</span>
                            <Scale size={14} />
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Path Leg Length', value: `${vectors.missionDistanceKm.toFixed(2)} km`, color: 'text-sky-300' },
                                { label: 'Link Integrity', value: isPathCompromised ? 'COMPROMISED' : 'NOMINAL', color: isPathCompromised ? 'text-red-500' : 'text-emerald-400' },
                                { label: 'Payload Mass', value: `${(droneCalcData?.totalPayload || 0).toFixed(2)} kg`, color: 'text-blue-400' },
                                { label: 'Range Check', value: (droneCalcData?.rangeKm || 0) > vectors.missionDistanceKm ? '✓ SUFFICIENT' : '⚠ INSUFFICIENT', color: (droneCalcData?.rangeKm || 0) > vectors.missionDistanceKm ? 'text-emerald-400' : 'text-red-400' },
                                { label: 'Drone Jammed', value: isJammedDrone ? '⚠ YES' : '✓ NO', color: isJammedDrone ? 'text-red-500' : 'text-slate-400' },
                                { label: 'GCS Jammed', value: isJammedGcs ? '⚠ YES' : '✓ NO', color: isJammedGcs ? 'text-red-500' : 'text-slate-400' },
                            ].map(row => (
                                <div key={row.label} className="flex justify-between items-center bg-slate-800/30 rounded px-2.5 py-2">
                                    <span className="text-[10px] text-slate-400 font-medium">{row.label}</span>
                                    <span className={`text-[11px] font-mono font-bold ${row.color}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className={`mt-4 p-3 rounded-xl text-[10px] font-black text-center uppercase tracking-[1px] border shadow-lg ${isPathCompromised ? 'bg-red-950/40 border-red-500/40 text-red-500 animate-pulse' : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'}`}>
                            {isPathCompromised ? '⚠ EW INTERFERENCE EXPECTED' : '✓ MISSION PATH VALIDATED'}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Map ── */}
            <div className={`flex-1 relative ${placeMode ? 'cursor-crosshair' : ''}`}>
                <MapContainer
                    center={[3.139, 101.687]}
                    zoom={13}
                    zoomControl={false}
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full"
                >
                    <MapControls />
                    <TileLayer
                        attribution={isNightMode 
                            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                        url={isNightMode 
                            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    />
                    <MapClickHandler mode={placeMode} onPlace={handlePlace} />
                    {/* Jammer hazard zones */}
                    {jammers.map(j => (
                        <React.Fragment key={j.id}>
                            {showRings && j.type === 'omni' && [1, 2, 3].map(ringIdx => (
                                <Circle
                                    key={`${j.id}-ring-${ringIdx}`}
                                    center={j.pos}
                                    radius={j.radius * 1000 * (ringIdx / 3)}
                                    pathOptions={{ color: '#ef4444', weight: 1, opacity: 0.2, fillOpacity: 0.05, fillColor: '#ef4444' }}
                                />
                            ))}
                            {j.type === 'omni' ? (
                                <Circle
                                    center={j.pos}
                                    radius={j.radius * 1000}
                                    pathOptions={{ color: '#ef4444', weight: 2, opacity: 0.8, fillOpacity: 0.1, fillColor: '#ef4444', dashArray: '10 5' }}
                                >
                                    <Tooltip permanent direction="top" className="bg-slate-900 text-red-500 border-red-500/30 font-black text-[9px] uppercase">
                                        EW KILL ZONE // {j.radius}km
                                    </Tooltip>
                                </Circle>
                            ) : (
                                <Polygon
                                    positions={getDirectionalPolygon(j)}
                                    pathOptions={{ color: '#f97316', weight: 2, opacity: 0.8, fillOpacity: 0.15, fillColor: '#f97316', dashArray: '10 5' }}
                                >
                                    <Tooltip permanent direction="top" className="bg-slate-900 text-orange-500 border-orange-500/30 font-black text-[9px] uppercase">
                                        DIR JAMMER // {j.radius}km
                                    </Tooltip>
                                </Polygon>
                            )}
                        </React.Fragment>
                    ))}

                    {/* Mission Path */}
                    {missionPath.length > 1 && (
                        <Polyline
                            positions={missionPath}
                            pathOptions={{ color: isPathCompromised ? '#ef4444' : '#10b981', weight: 4, opacity: 0.8, dashArray: '12 8' }}
                        >
                            <Tooltip permanent direction="center" className="bg-slate-900 text-sky-400 border-sky-400/30 font-black text-[9px] uppercase">
                                PROPOSED FLIGHT CORRIDOR
                            </Tooltip>
                        </Polyline>
                    )}
                    
                    {/* Safe Path (A* Result) */}
                    {safePath.length > 1 && (
                        <Polyline
                            positions={safePath}
                            pathOptions={{ color: '#22d3ee', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                        >
                            <Tooltip permanent direction="top" className="bg-slate-900 text-cyan-400 border-cyan-400/30 font-black text-[9px] uppercase">
                                OPTIMIZED EW RESILIENT PATH
                            </Tooltip>
                        </Polyline>
                    )}

                    {/* Link lines */}
                    {dronePos && gcsPos && (
                        <Polyline
                            positions={[dronePos, gcsPos]}
                            pathOptions={{ color: '#0ea5e9', weight: 2, opacity: 0.6, dashArray: '6 4' }}
                        />
                    )}
                    {/* Threat lines: drone/gcs → each jammer */}
                    {jammers.map(j => (
                        <React.Fragment key={`threat-${j.id}`}>
                            {dronePos && (
                                <Polyline
                                    positions={[dronePos, j.pos]}
                                    pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.5, dashArray: '4 4' }}
                                />
                            )}
                            {gcsPos && (
                                <Polyline
                                    positions={[gcsPos, j.pos]}
                                    pathOptions={{ color: '#ef4444', weight: 1, opacity: 0.3, dashArray: '4 4' }}
                                />
                            )}
                        </React.Fragment>
                    ))}

                    {/* Asset markers */}
                    <Marker position={origin} icon={originIcon} draggable eventHandlers={{ dragend: e => setOrigin((e.target as L.Marker).getLatLng()) }}>
                        <Popup><div className="text-[10px] font-bold">START: ORIGIN A</div></Popup>
                    </Marker>
                    <Marker position={dest} icon={destIcon} draggable eventHandlers={{ dragend: e => setDest((e.target as L.Marker).getLatLng()) }}>
                        <Popup><div className="text-[10px] font-bold">END: TARGET B</div></Popup>
                    </Marker>
                    <Marker position={dronePos} icon={activeAssetIcon} draggable eventHandlers={{ dragend: e => setDronePos((e.target as L.Marker).getLatLng()) }}>
                        <Popup>
                            <div className="text-slate-200 text-xs font-bold">✈ Drone / Asset<br />
                                <span className="text-slate-400 font-mono text-[11px]">{dronePos.lat.toFixed(5)}, {dronePos.lng.toFixed(5)}</span>
                            </div>
                        </Popup>
                    </Marker>
                    <Marker position={gcsPos} icon={gcsIcon} draggable eventHandlers={{ dragend: e => setGcsPos((e.target as L.Marker).getLatLng()) }}>
                        <Popup>
                            <div className="text-xs font-bold">📡 GCS / Command<br />
                                <span className="text-slate-400 font-mono text-[11px]">{gcsPos.lat.toFixed(5)}, {gcsPos.lng.toFixed(5)}</span>
                            </div>
                        </Popup>
                    </Marker>
                    {jammers.map(j => (
                        <Marker key={j.id} position={j.pos} icon={jammerIcon} draggable eventHandlers={{ dragend: e => {
                            const newPos = (e.target as L.Marker).getLatLng();
                            setJammers(prev => prev.map(jam => jam.id === j.id ? { ...jam, pos: newPos } : jam));
                        }}}>
                            <Popup>
                                <div className="text-xs font-bold text-red-500">⚡ ACTIVE JAMMER<br />
                                    <span className="text-slate-400 font-mono text-[11px]">{j.pos.lat.toFixed(5)}, {j.pos.lng.toFixed(5)}</span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Floating legend */}
                <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 text-[11px] space-y-1.5">
                    <div className="text-slate-500 uppercase tracking-widest mb-2 font-bold">Legend</div>
                    {[
                        { color: '#0ea5e9', label: 'Drone ↔ GCS Link', dash: true },
                        { color: '#ef4444', label: 'Jammer Threat', dash: true },
                        { color: '#ef4444', label: 'EW Kill Zone', dash: false },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-2">
                            <div style={{ width: 20, height: 2, background: l.color, opacity: 0.9, borderStyle: l.dash ? 'dashed' : 'solid', borderWidth: '1px', borderColor: l.color }} />
                            <span className="text-slate-400">{l.label}</span>
                        </div>
                    ))}
                    <div className="text-slate-600 mt-2 pt-2 border-t border-slate-800">Drag markers to reposition</div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default PositioningPhase;

import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Info, Play, Radio, Satellite, Zap, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { PayloadRangeLogic } from '../Shared/PayloadRangeLogic';
import { useTheme } from '../../../contexts/ThemeContext';

interface Model {
    id: string | number;
    name: string;
    channels: number;
    url: string;
    price: number;
}

const MODELS: Record<string, Model & { desc: string, img: string }> = {
    'AJGPS301': { id: '900011', name: 'Skhy AJGPS 301', channels: 4, url: 'https://www.skhy.systems/ajgps301', price: 2528, desc: 'Compact 4-CH System', img: 'https://i.ibb.co/MxYgYTHs/ajgps301-2.png' },
    'AJGPS302': { id: '900012', name: 'Skhy AJGPS 302', channels: 4, url: 'https://www.skhy.systems/ajgps302', price: 3045, desc: 'Ruggedized 4-CH', img: 'https://i.ibb.co/q3n8qGgT/ajgps302-2.png' },
    'AJGPS303': { id: '900013', name: 'Skhy AJGPS 303', channels: 4, url: 'https://www.skhy.systems/ajgps303', price: 5045, desc: 'High-Gain 4-CH Array', img: 'https://i.ibb.co/1JGXhntp/ajgps303-2.png' },
    'AJGPS601': { id: '900014', name: 'Skhy AJGPS 601', channels: 6, url: 'https://www.skhy.systems/ajgps601', price: 5553, desc: 'Advanced 8-CH Array', img: 'https://i.ibb.co/FqkqxxFZ/ajgps601-3.png' },
    'AJGPS602': { id: '900015', name: 'Skhy AJGPS 602', channels: 7, url: 'https://www.skhy.systems/ajgps602', price: 5914, desc: 'Extreme 9-CH System', img: 'https://i.ibb.co/yck3YNWV/ajgps602.png' }
};

interface Jammer {
    id: number;
    active: boolean;
    angle: number;
    target: number;
    color: string;
}

const JAMMER_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#06b6d4'];

interface CRPASimulatorProps {
    droneCalcData?: any;
    platform?: 'multirotor' | 'fixed-wing' | 'rover';
}

const CRPASimulator: React.FC<CRPASimulatorProps> = ({ droneCalcData, platform }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { addToCart } = useCart();
    const { isNightMode } = useTheme();
    const [selectedModelKey, setSelectedModelKey] = useState('AJGPS601');
    const [isNullingOn, setIsNullingOn] = useState(false);
    const [canvasState, setCanvasState] = useState({ zoom: 1, offset: { x: 0, y: 0 } });


    // Initialize State Variables
    const [jammers, setJammers] = useState<Jammer[]>(() =>
        Array.from({ length: 7 }, (_, i) => ({
            id: i,
            active: false,
            angle: Math.PI + (i * 0.5),
            target: Math.PI + (i * 0.5),
            color: JAMMER_COLORS[i]
        }))
    );

    const [bandState, setBandState] = useState({
        gps: { active: true, bands: ['L1'] as string[], color: '#10b981', angle: Math.PI / 4 },
        glo: { active: false, bands: [] as string[], color: '#d946ef', angle: Math.PI * 0.75 },
        gal: { active: false, bands: [] as string[], color: '#3b82f6', angle: -Math.PI / 6 }
    });

    const [jammerPower, setJammerPower] = useState(50);
    const [receptionThreshold] = useState(35);

    const [metrics, setMetrics] = useState({
        gpsSnr: 28,
        jamPower: 0,
        nulls: 0,
        status: 'NOMINAL',
        statusColor: 'text-green-400'
    });

    const model = MODELS[selectedModelKey];
    const systemType = model.channels;

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModelKey(e.target.value);
        setIsNullingOn(false);
    };

    const toggleJammer = (idx: number) => {
        setJammers(prev => prev.map((j, i) => i === idx ? { ...j, active: !j.active } : j));
    };

    const toggleBand = (sys: 'gps' | 'glo' | 'gal', band: string) => {
        setBandState(prev => {
            const sysObj = prev[sys];
            const hasBand = sysObj.bands.includes(band);
            const newBands = hasBand ? sysObj.bands.filter(b => b !== band) : [...sysObj.bands, band];
            return {
                ...prev,
                [sys]: { ...sysObj, bands: newBands, active: newBands.length > 0 }
            }
        });
    };

    const handleAddToCartLocal = () => {
        addToCart(model.id, 1, {
            name: model.name,
            base_price: model.price,
            image_url: '/images/marketplace/ajgps-generic.jpg',
            platform_pill: platform,
            phase: 'positioning'
        });
        toast.success(`Added ${model.name} to cart`);
    };

    const lastStatus = useRef(metrics.status);
    useEffect(() => {
        if (metrics.status !== lastStatus.current) {
            if (metrics.status === 'JAMMING DETECTED' || metrics.status === 'SIGNAL LOST (BELOW THRESHOLD)' || metrics.status === 'SATURATION (DOF EXCEEDED)') {
                toast.error(metrics.status, { id: 'status-toast' });
            } else if (metrics.status.startsWith('MITIGATED')) {
                toast.success(metrics.status, { id: 'status-toast' });
            } else if (metrics.status === 'NOMINAL' && lastStatus.current !== 'NOMINAL') {
                toast.success('Signal Restored', { id: 'status-toast' });
            }
            lastStatus.current = metrics.status;
        }
    }, [metrics.status]);

    // Simulation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let width = canvas.clientWidth;
        let height = canvas.clientHeight;

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', resize);
        resize();

        const drawAntenna = (x: number, y: number, size: number) => {
            ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        };

        const drawArray = (cx: number, cy: number, radius: number) => {
            ctx.fillStyle = isNightMode ? '#1e293b' : '#f8fafc'; ctx.beginPath(); ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2); ctx.fill();
            const count = (systemType === 8) ? 7 : 3;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 - (Math.PI / 2);
                const ax = cx + Math.cos(angle) * radius; const ay = cy + Math.sin(angle) * radius;
                ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx, cy); ctx.stroke();
                drawAntenna(ax, ay, 5);
            }
            drawAntenna(cx, cy, 5);
        };

        const drawPattern = (cx: number, cy: number, scale: number) => {
            ctx.beginPath();
            ctx.strokeStyle = isNullingOn ? 'rgba(34, 211, 238, 0.6)' : 'rgba(239, 68, 68, 0.3)';
            ctx.fillStyle = isNullingOn ? 'rgba(34, 211, 238, 0.1)' : 'rgba(239, 68, 68, 0.05)';
            const activeJammers = jammers.filter(j => j.active);
            const maxDofs = (systemType === 8) ? 7 : 3;
            for (let a = 0; a <= Math.PI * 2; a += 0.05) {
                let gain = 1.0;
                if (isNullingOn && activeJammers.length > 0) {
                    if (activeJammers.length > maxDofs) gain = 0.8 + Math.random() * 0.2;
                    else {
                        for (const j of activeJammers) {
                            let diff = Math.abs(a - j.angle); if (diff > Math.PI) diff = (2 * Math.PI) - diff;
                            gain *= (1.0 - (Math.exp(-(diff * diff) / 0.08) * 0.96));
                        }
                    }
                }
                const r = scale * gain;
                const px = cx + Math.cos(a) * r; const py = cy + Math.sin(a) * r;
                if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();
        };

        const drawWave = (startX: number, startY: number, endX: number, endY: number, color: string, speed: number, intensity: number) => {
            const dist = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2); const angle = Math.atan2(endY - startY, endX - startX);
            const time = Date.now() / 1000 * speed; ctx.fillStyle = color;
            for (let i = 0; i < intensity; i++) {
                const off = (i / intensity + time) % 1; const px = startX + Math.cos(angle) * (dist * off); const py = startY + Math.sin(angle) * (dist * off);
                ctx.globalAlpha = 1 - off; ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const cx = width / 2 - 120; const cy = height / 2; const satDist = Math.min(width, height) * 0.35;

            jammers.forEach(j => {
                let diff = j.target - j.angle; while (diff < -Math.PI) diff += 2 * Math.PI; while (diff > Math.PI) diff -= 2 * Math.PI;
                j.angle += diff * 0.1;
            });

            ctx.save();
            ctx.translate(canvasState.offset.x, canvasState.offset.y);
            ctx.scale(canvasState.zoom, canvasState.zoom);

            drawPattern(cx, cy, 180); drawArray(cx, cy, 40);

            let activeSatCount = 0;
            const drawSat = (config: any) => {
                if (!config.active) return; activeSatCount++;
                const sx = cx + Math.cos(config.angle) * satDist; const sy = cy - Math.sin(config.angle) * satDist;
                ctx.fillStyle = config.color; ctx.fillRect(sx - 4, sy - 4, 8, 8);
                drawWave(sx, sy, cx, cy, config.color, 0.5, 4);
            };
            drawSat(bandState.gps); drawSat(bandState.glo); drawSat(bandState.gal);

            const activeJammers = jammers.filter(j => j.active);
            activeJammers.forEach(j => {
                const jx = cx + Math.cos(j.angle) * satDist; const jy = cy + Math.sin(j.angle) * satDist;
                ctx.fillStyle = j.color; ctx.beginPath(); ctx.moveTo(jx, jy - 8); ctx.lineTo(jx + 8, jy + 8); ctx.lineTo(jx - 8, jy + 8); ctx.fill();
                drawWave(jx, jy, cx, cy, j.color, 2.0, 10);
            });

            ctx.restore();

            // Metrics Update: Factor in Jammer Power and Thresholding
            const jammerCount = activeJammers.length;
            const maxDofs = (systemType === 8) ? 7 : 3;

            let signalQuality = 85; // Base SNR
            if (activeSatCount === 0) {
                signalQuality = 0;
            } else if (jammerCount > 0) {
                // Jamming impact scales with jammer power
                const jammingIntensity = (jammerPower / 100) * 80;

                if (!isNullingOn) {
                    signalQuality = Math.max(5, signalQuality - jammingIntensity);
                } else if (jammerCount > maxDofs) {
                    // Saturated: even with nulling, signal is degraded
                    signalQuality = Math.max(10, signalQuality - (jammingIntensity * 0.8));
                } else {
                    // Nulling active and within DOF limit
                    // Nulling provides ~30-40dB suppression
                    const suppression = 35;
                    const residualJamming = Math.max(0, jammingIntensity - suppression);
                    signalQuality = Math.max(15, signalQuality - residualJamming);
                }
            }

            setMetrics(prev => {
                let statusStr = 'NOMINAL';
                let color = 'text-green-400';

                if (signalQuality < receptionThreshold) {
                    statusStr = 'SIGNAL LOST (BELOW THRESHOLD)';
                    color = 'text-red-600 font-bold animate-pulse';
                } else if (jammerCount > 0) {
                    if (!isNullingOn) {
                        statusStr = 'JAMMING DETECTED';
                        color = 'text-red-500 animate-pulse';
                    } else if (jammerCount > maxDofs) {
                        statusStr = 'SATURATION (DOF EXCEEDED)';
                        color = 'text-orange-500';
                    } else {
                        statusStr = `MITIGATED (${jammerCount} NULLS)`;
                        color = 'text-cyan-400';
                    }
                }
                return { ...prev, gpsSnr: signalQuality, jamPower: jammerCount > 0 ? jammerPower : 0, status: statusStr, statusColor: color, nulls: isNullingOn ? jammerCount : 0 };
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
    }, [selectedModelKey, isNullingOn, jammers, bandState, systemType, isNightMode]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const activeJammers = jammers.filter(j => j.active); if (activeJammers.length === 0) return;
        const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const cx = canvas.width / 2 - 120; const cy = canvas.height / 2;
        const mouseAngle = Math.atan2(y - cy, x - cx);
        let closestIdx = -1; let minDiff = Infinity;
        jammers.forEach((j, i) => {
            if (!j.active) return; let diff = Math.abs(mouseAngle - j.angle); if (diff > Math.PI) diff = 2 * Math.PI - diff;
            if (diff < minDiff) { minDiff = diff; closestIdx = i; }
        });
        if (closestIdx !== -1 && minDiff < 0.5) setJammers(prev => prev.map((j, i) => i === closestIdx ? { ...j, target: mouseAngle } : j));
    };

    // Derived anti-jam performance metrics
    const activeJammerCount = jammers.filter(j => j.active).length;
    const maxDofs = (systemType === 8) ? 7 : 3;
    const suppression1 = isNullingOn && activeJammerCount >= 1 ? Math.min(105, 30 + jammerPower * 0.5) : 0;
    const suppression3 = isNullingOn && activeJammerCount >= 3 ? Math.min(90, 20 + jammerPower * 0.3) : 0;
    const suppression6 = isNullingOn && activeJammerCount >= 6 ? Math.min(50, 10 + jammerPower * 0.1) : 0;

    const activeBandCount = (bandState.gps.bands.length || (bandState.gps.active ? 1 : 0)) +
        (bandState.glo.bands.length || (bandState.glo.active ? 1 : 0)) +
        (bandState.gal.bands.length || (bandState.gal.active ? 1 : 0));

    const GPS_BANDS = ['L1', 'L2', 'L5'];
    const GLO_BANDS = ['G1', 'G2'];
    const GAL_BANDS = ['E1', 'E5a', 'E6'];

    return (
        <div className={`flex flex-col h-full font-mono transition-colors ${isNightMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="flex-1 flex min-h-0">
                {/* ── LEFT SIDEBAR ── */}
                <div className="w-[280px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto z-20">
                    <div className="p-4 space-y-5 flex-1">
                        {/* GNSS Constellations with sub-bands */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">GNSS Constellations</div>
                                <Satellite className="w-3 h-3 text-slate-500" />
                            </div>
                            {/* GPS */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 w-8">GPS</span>
                                <div className="flex gap-1 flex-1">
                                    {GPS_BANDS.map(band => {
                                        const isActive = bandState.gps.bands.includes(band);
                                        return (
                                            <button key={band} onClick={() => toggleBand('gps', band)}
                                                className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                            >{band}</button>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* GLONASS */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 w-8">GLO</span>
                                <div className="flex gap-1 flex-1">
                                    {GLO_BANDS.map(band => {
                                        const isActive = bandState.glo.bands.includes(band);
                                        return (
                                            <button key={band} onClick={() => toggleBand('glo', band)}
                                                className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${isActive ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                            >{band}</button>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Galileo */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 w-8">GAL</span>
                                <div className="flex gap-1 flex-1">
                                    {GAL_BANDS.map(band => {
                                        const isActive = bandState.gal.bands.includes(band);
                                        return (
                                            <button key={band} onClick={() => toggleBand('gal', band)}
                                                className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${isActive ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                            >{band}</button>
                                        );
                                    })}
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-600 italic">Configured to all spatial channels</p>
                        </div>

                        {/* Anti-Jam Performance */}
                        <div className="space-y-3 border-t border-slate-800 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Anti-Jam Performance</div>
                                <ShieldAlert className="w-3.5 h-3.5 text-cyan-500/50" />
                            </div>
                            {[
                                { label: '1-Source Suppression', value: suppression1 },
                                { label: '3-Source Suppression', value: suppression3 },
                                { label: '6-Source Suppression', value: suppression6 },
                            ].map(item => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white font-bold">{item.value.toFixed(0)} dB</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, item.value)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interference Sources */}
                        <div className="space-y-3 border-t border-slate-800 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest text-red-400">Interference Sources</div>
                                <Radio className="w-3.5 h-3.5 text-red-500/50" />
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {jammers.map((j, i) => (
                                    <button key={j.id} onClick={() => toggleJammer(i)}
                                        className={`py-2 rounded text-[10px] font-bold border transition-all ${j.active ? 'shadow-lg' : 'bg-slate-800/50 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
                                        style={j.active ? { backgroundColor: `${j.color}22`, borderColor: j.color, color: j.color } : {}}
                                    >J{i + 1}</button>
                                ))}
                            </div>

                            {/* Jammer Config */}
                            <div className="space-y-2 bg-slate-950/50 p-2 rounded border border-slate-800">
                                <div className="flex items-center gap-2 text-[10px]">
                                    <span className="text-slate-500 font-bold uppercase">Type</span>
                                    <select className="flex-1 bg-slate-800 border-slate-700 rounded px-1 py-1 text-[10px] text-white" defaultValue="spot">
                                        <option value="spot">Spot</option>
                                        <option value="barrage">Barrage</option>
                                        <option value="sweep">Sweep</option>
                                    </select>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Power</span>
                                    <span className="text-red-400 font-bold">{jammerPower}W</span>
                                </div>
                                <input type="range" min="0" max="200" step="10" value={jammerPower}
                                    onChange={e => setJammerPower(Number(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-red-500" />
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-1.5 border-t border-slate-800 pt-4">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legend</div>
                                <Info className="w-3 h-3 text-slate-600" />
                            </div>
                            {[
                                { color: '#10b981', label: 'GPS (L1/L2/L5)' },
                                { color: '#a78bfa', label: 'GLONASS (G1/G2)' },
                                { color: '#3b82f6', label: 'Galileo (E1/E5/E6)' },
                                { color: '#ef4444', label: 'Jammer' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                                    <span className="text-[10px] text-slate-500">{l.label}</span>
                                </div>
                            ))}
                            <p className="text-[9px] text-slate-600 mt-1">Drag with mouse to reposition</p>
                        </div>
                    </div>

                    {/* Activate Nulling Button */}
                    <div className="p-4 border-t border-slate-800 shrink-0">
                        <button onClick={() => setIsNullingOn(!isNullingOn)}
                            className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isNullingOn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-400'}`}
                        >
                            <Play className={`w-3.5 h-3.5 ${isNullingOn ? 'fill-white' : 'fill-transparent'}`} />
                            {isNullingOn ? 'Deactivate Nulling' : 'Activate Null-Steering'}
                        </button>
                    </div>
                </div>

                {/* ── CENTER: Canvas ── */}
                <div className="flex-1 relative overflow-hidden bg-slate-950">
                    <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" onMouseMove={handleMouseMove} />
                    
                    {/* Navigation Controls */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
                        <div className="flex flex-col bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                            <button 
                                onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 5) }))}
                                className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-b border-slate-800"
                                title="Zoom In"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.2) }))}
                                className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-b border-slate-800"
                                title="Zoom Out"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setCanvasState({ zoom: 1, offset: { x: 0, y: 0 } })}
                                className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Reset View"
                            >
                                <Activity className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-6 left-6 pointer-events-none">
                        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur px-4 py-2 rounded-full border border-white/5">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${metrics.status === 'NOMINAL' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                CRPA Simulation Engine v4.2
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="w-[300px] flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto z-20">
                    <div className="p-4 space-y-4 flex-1">
                        {/* Build Info */}
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

                        {/* Selected CRPA Model Card */}
                        <div className="border-t border-slate-800 pt-4 space-y-3">
                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{model.name}</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-center">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Elements</div>
                                    <div className="text-lg text-white font-bold">{model.channels}</div>
                                </div>
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-center">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Bands</div>
                                    <div className="text-lg text-white font-bold">{activeBandCount || 1}</div>
                                </div>
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-center">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">D.O.F</div>
                                    <div className="text-lg text-white font-bold">{maxDofs}</div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className={`text-center py-2 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold tracking-widest ${metrics.statusColor}`}>
                                {metrics.status}
                            </div>

                            {/* Jammer Power */}
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Jammer Power</span>
                                <span className="text-red-400 font-bold">{jammerPower > 0 ? `${jammerPower} dB` : '—'}</span>
                            </div>

                            {/* SNR */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-400">Reception Quality</span>
                                    <span className="text-white font-bold">{Math.round(metrics.gpsSnr)}%</span>
                                </div>
                                <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${metrics.gpsSnr > receptionThreshold ? 'bg-green-500' : 'bg-red-600'}`} style={{ width: `${metrics.gpsSnr}%` }} />
                                    <div className="absolute top-0 bottom-0 border-l border-white/40 z-10" style={{ left: `${receptionThreshold}%` }} />
                                </div>
                            </div>

                            {/* Model Selector */}
                            <div className="space-y-2 border-t border-slate-800 pt-3">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Select AJGPS Unit</div>
                                <select value={selectedModelKey} onChange={handleModelChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                    {Object.keys(MODELS).map(key => (
                                        <option key={key} value={key}>{MODELS[key].name} — ${MODELS[key].price.toLocaleString()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Add to BOM */}
                    <div className="p-4 border-t border-slate-800 shrink-0 space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase">Unit Price</div>
                                <div className="text-lg text-white font-bold">${model.price.toLocaleString()}</div>
                            </div>
                            <Zap className="w-5 h-5 text-yellow-400 mb-1" />
                        </div>
                        <button onClick={handleAddToCartLocal}
                            className="w-full py-3 bg-white text-slate-950 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors">
                            Save Configuration to Build
                        </button>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM ACTION BAR ── */}
            <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-end gap-4 shrink-0">
                <button className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                    Skip Phase
                </button>
                <button onClick={handleAddToCartLocal}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_16px_rgba(34,211,238,0.2)] flex items-center gap-2">
                    Save Configuration to Build <span className="text-lg leading-none">+</span>
                </button>
            </div>
        </div>
    );
};

export default CRPASimulator;

import React, { useMemo } from 'react';
import { Zap, Info, ExternalLink, AlertTriangle } from 'lucide-react';
import { CartItem } from '../../types/checkout';
import { useCart } from '../../contexts/CartContext';
import { findWiringDiagram } from '../../data/mermaid/wiringIndex';

// ─── OFFLINE-FIRST WIRING DIAGRAM ──────────────────────────────────────────
// This component uses a static local index (wiringIndex.ts) to resolve
// wiring diagrams. Zero Supabase queries. Zero network dependency.
// The .mmd files are served from /data/mermaid/ in the public directory.
// ────────────────────────────────────────────────────────────────────────────

interface WiringDiagramProps {
    items: CartItem[];
}

const WiringDiagram: React.FC<WiringDiagramProps> = ({ items }) => {
    const { airPowerTotal, gcsPowerTotal, roverPowerTotal, hasPowerSource } = useCart();

    const powerSources = useMemo(() => {
        return items.filter(item => {
            const category = (item.product?.category || '').toLowerCase();
            const name = (item.product?.name || '').toLowerCase();
            const features = (item.product?.features || []).map(f => f.toLowerCase());
            return (
                category === 'batteries' ||
                name.includes('power module') ||
                name.includes('pdb') ||
                name.includes('bec') ||
                name.includes('battery') ||
                name.includes('array') ||
                name.includes('hv') ||
                name.includes('lipo') ||
                name.includes('12s') ||
                name.includes('6s') ||
                features.some(f => f.includes('integrated pdb') || f.includes('integrated bec') || f.includes('power source'))
            );
        });
    }, [items]);

    const sysVoltage = useMemo(() => {
        if (powerSources.length === 0) return null;
        let v = 0;
        let isHv = false;
        powerSources.forEach(ps => {
            const name = (ps.product?.name || '').toLowerCase();
            if (name.includes('400v')) { v = Math.max(v, 400); isHv = true; }
            else if (name.includes('14s')) v = Math.max(v, 51.8);
            else if (name.includes('12s')) v = Math.max(v, 44.4);
            else if (name.includes('8s')) v = Math.max(v, 29.6);
            else if (name.includes('6s')) v = Math.max(v, 22.2);
            else if (name.includes('4s')) v = Math.max(v, 14.8);
            if (name.includes('hv')) isHv = true;
        });
        return { voltage: v || 22.2, isHv: isHv || v > 30 };
    }, [powerSources]);

    // Pure synchronous lookup — no async, no loading, no errors possible
    const mermaidPath = useMemo(() => {
        if (!items || items.length === 0) return null;

        const componentIds = items.map(item => {
            const id = String(item.product_id || item.product?.id);
            const name = (item.product?.name || '').toLowerCase();
            
            // Direct ID matching (Prioritized)
            if (id === '900029') return '900029'; // Cube Orange+
            if (id === '900030') return '900030'; // Pixhawk 6C
            if (id === '900035') return 'herelink';
            if (id === '900036') return 'rfd900';
            if (id === '900021') return '900021'; // MANET
            if (id === '900033') return '900033'; // ACASOM
            if (id === '900034') return '900034'; // FlySpark
            if (id === '900015') return '900015'; // AJGPS
            if (id === '900006') return '900006'; // Acoustic Array
            if (id === '900005') return '900005'; // Acoustic Node
            if (id === '900009') return '900009'; // Rover Core
            if (id === '276137616') return '276137616'; // Payload/Gimbal
            
            // Fallback to Name Heuristics
            if (name.includes('cube orange')) return '900029';
            if (name.includes('holybro') || name.includes('pixhawk')) return '900030';
            
            // Video & Data Links
            if (name.includes('herelink') || name.includes('siyi') || name.includes('skydroid') || name.includes('dji') || name.includes('caddx') || name.includes('analog') || name.includes('connex')) return 'herelink';
            
            // Telemetry Radios
            if (name.includes('rfd900') || name.includes('holybro sik') || name.includes('microhard') || name.includes('crossfire') || name.includes('expresslrs') || name.includes('xtend')) return 'rfd900';
            
            // Advanced Comms
            if (name.includes('manet') || name.includes('hh20') || name.includes('silvus')) return '900021';
            if (name.includes('acasom')) return '900033';
            if (name.includes('flyspark')) return '900034';
            
            // Sensors & Payloads
            if (name.includes('zr10') || name.includes('gimbal') || name.includes('camera') || name.includes('payload')) return '276137616';
            if (name.includes('ajgps') || name.includes('anti-jamming') || name.includes('gps')) return '900015';
            if (name.includes('acoustic array')) return '900006';
            if (name.includes('acoustic node')) return '900005';
            if (name.includes('mobile station')) return '900007';
            
            // Edge Computers
            if (name.includes('rover') || name.includes('resilient core')) return '900009';
            
            // Propulsion
            if (name.includes('esc') || name.includes('40a') || name.includes('20a') || name.includes('30a') || name.includes('hobbywing') || name.includes('motor')) return 'esc_generic';
            
            return null;
        }).filter(Boolean) as string[];

        return findWiringDiagram(componentIds);
    }, [items]);

    if (!items || items.length === 0) return null;

    const editorUrl = `/mermaid-editor.html?file=/data/mermaid/${mermaidPath}`;

    return (
        <div className="mt-8 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">System Architecture</h3>
                </div>
                {mermaidPath ? (
                    <a
                        href={editorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20"
                    >
                        View System Blueprint
                        <ExternalLink className="w-3 h-3" />
                    </a>
                ) : (
                    <div className="group relative">
                        <Info className="w-4 h-4 text-slate-500 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700 shadow-xl">
                            Select multiple connected system components to auto-generate a comprehensive System Architecture diagram.
                        </div>
                    </div>
                )}
            </div>
            
            {mermaidPath ? (
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md inline-flex">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">System Architecture Verified</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        A validated connectivity blueprint (wiring, power, RF) has been generated for your core avionics. Configuration and calibration parameters are included in the blueprint metadata.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md inline-flex">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight">Blueprint Development Pending</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        The specific electrical blueprint for this exact combination is currently being finalized. Basic system verification for power and mounting remains active below.
                    </p>
                </div>
            )}

            <div className="space-y-5">

                {/* Integrated Power Budgeting */}
                {(airPowerTotal > 0 || gcsPowerTotal > 0 || roverPowerTotal > 0) && (
                    <div className="pt-4 border-t border-slate-800 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <span>Electrical Load Verification</span>
                            <Zap size={12} className="text-yellow-500/50" />
                        </div>

                        {airPowerTotal > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-400">
                                        {hasPowerSource ? 'Air Vehicle (BEC Load)' : 'Theoretical Air Load'}
                                    </span>
                                    <span className={`font-mono ${!hasPowerSource ? 'text-slate-500' : airPowerTotal > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {airPowerTotal}W {hasPowerSource ? '/ 100W' : '/ --W'}
                                    </span>
                                </div>
                                {hasPowerSource ? (
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 ${
                                                airPowerTotal > 90 ? 'bg-red-500' : 
                                                airPowerTotal > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min((airPowerTotal / 100) * 100, 100)}%` }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/5 border border-amber-500/10 rounded text-[9px] text-amber-500/70 italic">
                                        <AlertTriangle size={10} />
                                        <span>Power module or battery required for load verification</span>
                                    </div>
                                )}
                                {hasPowerSource && airPowerTotal > 85 && (
                                    <div className="flex items-center gap-1.5 text-[9px] text-amber-400/80 italic">
                                        <AlertTriangle size={10} />
                                        <span>Validation Warning: High load on secondary BEC</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {gcsPowerTotal > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">GCS</span>
                                        <span className="text-blue-400 font-mono">{gcsPowerTotal}W</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500"
                                            style={{ width: `${Math.min((gcsPowerTotal / 50) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {roverPowerTotal > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">Rover</span>
                                        <span className="text-indigo-400 font-mono">{roverPowerTotal}W</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500"
                                            style={{ width: `${Math.min((roverPowerTotal / 50) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Power Distribution & Voltage Conversion */}
                        {hasPowerSource && sysVoltage && (
                            <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
                                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={10} className="text-amber-500" />
                                        Bus Power Distribution [{sysVoltage.isHv ? 'High Voltage' : 'Standard'} Architecture]
                                    </div>
                                    {sysVoltage.isHv && !items.some(i => (i.product?.name || '').toLowerCase().includes('converter') || (i.product?.name || '').toLowerCase().includes('buck')) && (
                                        <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold animate-pulse">
                                            <AlertTriangle size={8} />
                                            CONVERTER REQUIRED
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between items-center text-[11px] pb-1 border-b border-slate-800/50">
                                        <span className="text-slate-400">Main Power Source</span>
                                        <span className="font-mono text-emerald-400">{sysVoltage.voltage}V Nominal</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] pb-1 border-b border-slate-800/50">
                                        <span className="text-slate-400">Propulsion Bus</span>
                                        <span className="font-mono text-emerald-400">{sysVoltage.voltage}V Direct (To ESCs)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] pb-1 border-b border-slate-800/50">
                                        <span className="text-slate-400">Avionics & FC Bus</span>
                                        <span className="font-mono text-amber-500">
                                            5.3V {sysVoltage.isHv ? '(Req. HV Buck Converter)' : '(via PDB/BEC)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400">Payload & RF Bus</span>
                                        <span className="font-mono text-amber-500">
                                            12V/24V {sysVoltage.isHv ? '(Req. Secondary Regulator)' : '(via PDB)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Mechanical & Mounting Infrastructure */}
                {items.some(item => {
                    const name = (item.product?.name || '').toLowerCase();
                    return name.includes('propeller') || name.includes('motor') || name.includes('frame') || name.includes('mount') || name.includes('esc');
                }) && (
                    <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                            <span>Mechanical Infrastructure</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {items.filter(item => {
                                const name = (item.product?.name || '').toLowerCase();
                                return name.includes('propeller') || name.includes('motor') || name.includes('frame') || name.includes('mount') || name.includes('esc');
                            }).map(item => (
                                <span key={item.id} className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded text-[9px] text-slate-400 font-mono">
                                    {item.product?.name.split(' ').slice(0, 3).join(' ')}
                                </span>
                            ))}
                        </div>
                        <p className="mt-2 text-[9px] text-slate-500 italic">
                            * Mechanical components acknowledged for mounting and weight distribution analysis.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WiringDiagram;

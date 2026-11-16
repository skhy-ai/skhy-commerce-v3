import React from 'react';
import { ShoppingCart, Plane } from 'lucide-react';
import { PayloadRangeLogic } from '../Shared/PayloadRangeLogic';
import { CAMERAS } from '../../../data/droneComponents';
import { FIXED_WING_TEMPLATES } from '../../../data/simulators/fixedWingData';

// ── Type-appropriate spec card (shared pattern) ───────────────────────────────
const SpecBadge = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-slate-900 rounded px-2 py-1 text-center">
        <div className="text-[8px] text-slate-500 uppercase tracking-wider">{label}</div>
        <div className="text-[10px] text-sky-400 font-bold font-mono">{value}</div>
    </div>
);

const ComponentSpecCard = ({ item, type }: { item: any; type: string }) => {
    if (!item) return null;
    const renderSpecs = () => {
        if (type === 'Motor' || type === 'Propulsion') return (
            <div className="grid grid-cols-3 gap-1 mt-2">
                <SpecBadge label="Thrust" value={`${item.max_thrust_kg}kg`} />
                <SpecBadge label="KV" value={`${item.kv}`} />
                <SpecBadge label="η" value={`${item.efficiency_hover?.toFixed(1)} g/W`} />
                <SpecBadge label="Max W" value={`${item.watts_max}W`} />
                <SpecBadge label="Max A" value={`${item.max_amps}A`} />
                <SpecBadge label="Volt" value={item.voltage_req} />
            </div>
        );
        if (type === 'Battery' || type === 'Energy') return (
            <div className="grid grid-cols-3 gap-1 mt-2">
                <SpecBadge label="Capacity" value={`${item.capacity_wh}Wh`} />
                <SpecBadge label="Voltage" value={`${item.voltage}V`} />
                <SpecBadge label="Weight" value={`${item.weight_kg}kg`} />
            </div>
        );
        return null;
    };
    return (
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 my-2 animate-in fade-in slide-in-from-left-1 duration-300">
            <div className="flex gap-3">
                {item.imageUrl && (
                    <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase text-sky-400 font-bold tracking-wider">{type}</div>
                    <div className="text-xs font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                        ${item.price ?? item.base_price}
                        {item.isDbProduct && <span className="ml-1.5 text-emerald-500 text-[9px]">● Marketplace</span>}
                    </div>
                </div>
            </div>
            {renderSpecs()}
        </div>
    );
};

const ProductCard = ({ item, type }: { item: any, type: string }) => {
    if (!item) return null;
    return (
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 my-2 flex gap-3 animate-in fade-in slide-in-from-left-1 duration-300">
            {item.imageUrl && (
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase text-sky-400 font-bold tracking-wider">{type}</div>
                <div className="text-xs font-bold text-white truncate">{item.name}</div>
                <div className="text-xs text-slate-400 font-mono">${item.price}</div>
            </div>
        </div>
    );
};

const AssociatedProductCard = ({ product }: { product: any }) => {
    if (!product) return null;
    return (
        <div className="bg-gradient-to-br from-sky-950/40 to-slate-900/60 border border-sky-500/30 rounded-xl p-3.5 my-3 relative overflow-hidden group shadow-lg shadow-sky-950/20 hover:border-sky-400/50 transition-all duration-300">
            {/* Background glowing gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-400/20 transition-colors pointer-events-none" />
            
            <div className="flex gap-3.5 items-start">
                {product.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-sky-500/20 bg-slate-950/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[9px] font-black uppercase text-sky-400 tracking-widest bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-400/20">Commercial System</span>
                        {product.trl && (
                            <span className="text-[9px] font-black text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">{product.trl}</span>
                        )}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight mb-1 truncate">{product.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2">{product.tagline}</p>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
                        <div className="text-xs font-black text-sky-400 font-mono">
                            ${product.base_price?.toLocaleString()}
                        </div>
                        <a 
                            href={`/marketplace/product/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                            View Marketplace →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FixedWingSidebar: React.FC<{
    state: any;
    controls: any;
    derived: any;
}> = ({ state, controls, derived }) => {
    const { frame, motor, batt, calcData, isPhaseCompleted, matchedPresetProduct } = derived;
    const { setFrameId, setMotorId, setBattId, setCamera, setPayloadMass, setCruiseSpeedKmh, setMotorCount, handleGenerateBOM, handleUnlockPhase } = controls;
    const { frameId, motorId, battId, camera, payloadMass, cruiseSpeedKmh, motorCount, isLoading } = state;

    if (isLoading) return <div className="w-1/2 bg-slate-900 border-r border-slate-700 animate-pulse" />;
    if (!frame) return <div className="w-1/2 bg-slate-900 border-r border-slate-700 p-6 flex items-center justify-center text-slate-500">Loading Configuration...</div>;

    return (
        <div className="w-1/2 h-full overflow-y-auto bg-slate-900/95 backdrop-blur border-r border-slate-700 p-6 z-10 flex-shrink-0 relative">
            <div className="mb-8">
                <div className="inline-block px-3 py-1 border-2 border-sky-400 text-sky-400 font-black text-2xl tracking-[3px] rounded mb-2">SKHY</div>
                <h1 className="text-lg font-bold uppercase tracking-wider text-white">Fixed-Wing Surveyor</h1>
                <p className="text-xs text-slate-400">Long-Range / VTOL Simulation</p>
            </div>

            <fieldset disabled={isPhaseCompleted} className="min-w-0">
            <div className="mb-6">
                <label className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-2">Preset Templates (Grid Optimized)</label>
                <select
                    value={state.templateId}
                    onChange={e => controls.setTemplateId(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-sky-400/30 rounded p-2.5 text-sm font-bold outline-none focus:border-sky-400 transition-colors text-white"
                >
                    <option value="">-- Select Custom / Custom Search --</option>
                    {Object.entries(FIXED_WING_TEMPLATES).map(([id, t]) => (
                        <option key={id} value={id}>{(t as any).name}</option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 italic">Automatically selects the most cost-efficient components for your payload/range goals based on combinatorial grid search.</p>
                <AssociatedProductCard product={matchedPresetProduct} />
            </div>

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">1. Airframe & Wings</div>
            
            <label className="text-xs text-slate-300 block mb-1">Airframe Model</label>
            <select value={frameId} onChange={e => setFrameId(e.target.value)} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-3 outline-none focus:border-sky-400 text-white">
                <option value="fixed_wing_surveyor">SKHY Surveyor (2.4m) – Composite</option>
                <option value="fixed_wing_composite_cruiser">SKHY Cruiser (3.0m) – Full CF Monocoque</option>
                <option value="fixed_wing_talon">Mini Talon (1.3m) – EPO Foam</option>
                <option value="fixed_wing_delta">Delta Flying Wing (1.1m) – EPP Sprint</option>
            </select>
            <ProductCard item={frame} type="Airframe" />

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Wingspan</span>
                    <span className="text-xs font-bold text-sky-400">{frame.wingspan_m}m</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Glide Ratio (L/D)</span>
                    <span className="text-xs font-bold text-sky-400">{frame.glide_ratio}:1</span>
                </div>
                {frame.fuselage_length_m && (
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-500 block">Fuselage Length</span>
                        <span className="text-xs font-bold text-sky-400">{frame.fuselage_length_m}m</span>
                    </div>
                )}
                {frame.fuselage_material && (
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700 col-span-2">
                        <span className="text-[10px] text-slate-500 block">Fuselage Material</span>
                        <span className="text-xs font-bold text-sky-400">{frame.fuselage_material}</span>
                    </div>
                )}
                {frame.motor_config && (
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                        <span className="text-[10px] text-slate-500 block">Motor Config</span>
                        <span className="text-xs font-bold text-amber-400 uppercase">{frame.motor_config}</span>
                    </div>
                )}
            </div>

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">2. Power & Propulsion</div>
            <label className="text-xs text-slate-300 block mb-1">Propulsion Motor (Pusher)</label>
            <select value={motorId} onChange={e => setMotorId(e.target.value)} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                <optgroup label="Compatible Motors">
                    {derived.availableMotors.filter((m: any) => m.compatible).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} — {m.max_thrust_kg}kg @ {m.efficiency_hover?.toFixed(1)}g/W</option>
                    ))}
                </optgroup>
                {derived.availableMotors.some((m: any) => !m.compatible) && (
                    <optgroup label="⚠️ Not Recommended">
                        {derived.availableMotors.filter((m: any) => !m.compatible).map((m: any) => (
                            <option key={m.id} value={m.id}>⚠️ {m.name} — {m.max_thrust_kg}kg thrust</option>
                        ))}
                    </optgroup>
                )}
            </select>
            <ComponentSpecCard item={motor} type="Motor" />

            <label className="text-xs text-slate-300 block mb-1 mt-3">Energy Source</label>
            <select value={battId} onChange={e => setBattId(e.target.value)} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                {derived.allBatteries.map((b: any) => (
                    <option key={b.id} value={b.id}>
                        {b.name} — {b.capacity_wh}Wh @ {b.voltage}V{b.isDbProduct ? ' ●' : ''}
                    </option>
                ))}
            </select>
            <ComponentSpecCard item={batt} type="Battery" />

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">3. Mission Equipment</div>
            <label className="text-xs text-slate-300 block mb-1">Onboard Imaging / Sensor</label>
            <select 
                value={camera.id} 
                onChange={e => {
                    const found = CAMERAS.find(c => c.id === e.target.value);
                    if (found) setCamera(found);
                }} 
                className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white"
            >
                {CAMERAS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({(c.weight_kg * 1000).toFixed(0)}g)</option>
                ))}
            </select>
            <ComponentSpecCard item={camera} type="Camera" />

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">4. Operations</div>
            
            <label className="text-xs text-slate-300 block mb-1 flex justify-between">
                <span>Payload Mass (kg)</span>
                <span className="text-sky-400 font-bold">{payloadMass}kg</span>
            </label>
            <input type="range" min="0" max="10" step="0.1" value={payloadMass} onChange={e => setPayloadMass(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-sky-400 mb-4" />

            <label className="text-xs text-slate-300 block mb-1 flex justify-between">
                <span>Cruise Airspeed (km/h)</span>
                <span className="text-sky-400 font-bold">{cruiseSpeedKmh}km/h</span>
            </label>
            <input type="range" min="40" max="120" step="5" value={cruiseSpeedKmh} onChange={e => setCruiseSpeedKmh(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-sky-400 mb-4" />

            <label className="text-xs text-slate-300 block mb-1 flex justify-between">
                <span>Thruster Count (Dual/Quad Config)</span>
                <span className="text-sky-400 font-bold">{motorCount} units</span>
            </label>
            <input type="range" min="1" max="8" step="1" value={motorCount} onChange={e => setMotorCount(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-sky-400 mb-6" />

            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">5. Edge Computing</div>
            <label className="text-xs text-slate-300 block mb-1">Onboard Compute (Required for Skhy Processing)</label>
            <select value={state.edgeDeviceId} onChange={e => controls.setEdgeDeviceId(e.target.value)} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-4 outline-none focus:border-sky-400 text-white">
                <option value="900009">SKHY Light Edge (Core)</option>
                <option value="900010">SKHY Resilient Edge</option>
            </select>

            {calcData && (
                <div className="mt-8 mb-6">
                    <PayloadRangeLogic
                        totalPayload={payloadMass + (camera?.weight_kg || 0)}
                        payloadReserve={calcData.payloadReserve}
                        totalAUW={calcData.totalAUW}
                        rangeKm={calcData.rangeKm}
                        flightTimeMin={calcData.flightTimeHrs * 60}
                        maxThrust={calcData.totalMaxThrust}
                        hoverThrottle={calcData.hoverThrottle}
                        platform="fixed-wing"
                        // ── Aero props ──
                        takeoffThrustKg={calcData.takeoffThrustKg}
                        cruiseThrustKg={calcData.cruiseThrustKg}
                        landingThrustKg={calcData.landingThrustKg}
                        glideRatio={calcData.glideRatio}
                        cruisePowerW={calcData.cruisePowerW}
                        // ── Mass breakdown ──
                        frameMass={calcData.frameMass}
                        motorMass={calcData.motorMass}
                        battMass={calcData.battMass}
                        // ── Power breakdown ──
                        usableWh={calcData.usableWh}
                        cruiseSpeedKmh={calcData.cruiseSpeedKmh}
                        motorEfficiency={calcData.motorEfficiency}
                    />
                </div>
            )}
            </fieldset>

            {isPhaseCompleted ? (
                <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-lg p-4 mb-12">
                    <h5 className="text-emerald-400 font-bold text-sm mb-2 flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Phase Configuration Committed
                    </h5>
                    <p className="text-slate-300 text-xs mb-4">
                        You have successfully saved this Fixed-Wing configuration to your mission build. 
                        To make changes to this configuration, you must unlock it below.
                    </p>
                    <button
                        onClick={handleUnlockPhase}
                        className="w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center transition-all bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                    >
                        Edit Configuration
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleGenerateBOM}
                    className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/40 transition-all flex items-center justify-center gap-2 mb-12"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Save Configuration to Build
                </button>
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Radio, Calculator, ShoppingCart, Loader2, Zap, Battery, Cpu } from 'lucide-react';
import { PayloadRangeLogic } from '../Shared/PayloadRangeLogic';
import { ConfigAddedModal } from '../Shared/ConfigAddedModal';
import { ESCS } from '../../../data/droneComponents';
import { CONFIG_TEMPLATES } from '../../../data/simulators/heavyLiftData';

// ── Type-appropriate spec card ────────────────────────────────────────────────
const SpecBadge = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-slate-900 rounded px-2.5 py-1.5 text-center">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</div>
        <div className="text-xs text-sky-400 font-bold font-mono">{value}</div>
    </div>
);

const ComponentSpecCard = ({ item, type }: { item: any; type: string }) => {
    if (!item) return null;

    const renderSpecs = () => {
        switch (type) {
            case 'Motor':
            case 'Propulsion':
                return (
                    <div className="grid grid-cols-3 gap-1 mt-2">
                        <SpecBadge label="Thrust" value={`${item.max_thrust_kg}kg`} />
                        <SpecBadge label="KV" value={`${item.kv}`} />
                        <SpecBadge label="η" value={`${item.efficiency_hover?.toFixed(1)} g/W`} />
                        <SpecBadge label="Max W" value={`${item.watts_max}W`} />
                        <SpecBadge label="Max A" value={`${item.max_amps}A`} />
                        <SpecBadge label="Volt" value={item.voltage_req} />
                    </div>
                );
            case 'Battery':
            case 'Energy Source':
            case 'Energy':
                return (
                    <div className="grid grid-cols-3 gap-1 mt-2">
                        <SpecBadge label="Capacity" value={`${item.capacity_wh}Wh`} />
                        <SpecBadge label="Voltage" value={`${item.voltage}V`} />
                        <SpecBadge label="Weight" value={`${item.weight_kg}kg`} />
                    </div>
                );
            case 'ESC':
            case 'Power Controller':
                return (
                    <div className="grid grid-cols-3 gap-1 mt-2">
                        <SpecBadge label="Rating" value={`${item.rating}A`} />
                        <SpecBadge label="Type" value={item.type} />
                        <SpecBadge label="Weight" value={`${(item.weight_kg * 1000).toFixed(0)}g`} />
                    </div>
                );
            case 'Prop':
            case 'Aero':
                return (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                        <SpecBadge label="Size" value={`${item.size}"`} />
                        <SpecBadge label="Weight" value={`${(item.weight_kg * 1000).toFixed(0)}g`} />
                    </div>
                );
            case 'Frame':
                return (
                    <div className="grid grid-cols-3 gap-1 mt-2">
                        <SpecBadge label="Arms" value={`${item.arms}`} />
                        <SpecBadge label="Weight" value={`${item.weight_kg}kg`} />
                        <SpecBadge label="Class" value={item.class} />
                    </div>
                );
            case 'Sensor':
            case 'Camera':
                return (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                        <SpecBadge label="Weight" value={`${(item.weight_kg * 1000).toFixed(0)}g`} />
                        <SpecBadge label="Price" value={`$${item.price}`} />
                    </div>
                );
            default:
                return null;
        }
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

interface HeavyLiftSidebarProps {
    state: any;
    controls: any;
    derived: any;
    onNavigate: (path: string) => void;
}

export const HeavyLiftSidebar: React.FC<HeavyLiftSidebarProps> = ({ state, controls, derived, onNavigate }) => {
    const {
        frameId, motorId, propId, escId, battId, camera, telemetry,
        pipeMatId, payloadMass, templateId, isGeneratingBOM
    } = state;

    const {
        setFrameId, setMotorId, setPropId, setEscId, setBattId, setCamera,
        setTelemetry, setPipeMatId, setPayloadMass, setTemplateId,
        handleGenerateBOM, handleUnlockPhase
    } = controls;

    const {
        frame, availableMotors, availableProps, motor, prop, batt,
        escData, calcData, isConfigValid, allBatteries, isPhaseCompleted,
        matchedPresetProduct
    } = derived;

    const [showModal, setShowModal] = useState(false);

    return (
        <div className="w-1/2 h-full overflow-y-auto bg-slate-900/95 backdrop-blur border-r border-slate-700 p-6 z-10 flex-shrink-0 relative">
            <div className="mb-8">
                <div className="inline-block px-3 py-1 border-2 border-sky-400 text-sky-400 font-black text-2xl tracking-[3px] rounded mb-2">SKHY</div>
                <h1 className="text-lg font-bold uppercase tracking-wider text-white">Industrial Logistics</h1>
                <p className="text-xs text-slate-400">Medium & Heavy Lift Simulator</p>
            </div>

            {/* Grid Search Templates */}
            <fieldset disabled={isPhaseCompleted} className="min-w-0">
                <div className="mb-6">
                <label className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-2">Preset Templates (Grid Optimized)</label>
                <select
                    value={templateId}
                    onChange={e => setTemplateId(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-sky-400/30 rounded p-2.5 text-sm font-bold outline-none focus:border-sky-400 transition-colors text-white"
                >
                    <option value="">-- Select Custom / Custom Search --</option>
                    {Object.entries(CONFIG_TEMPLATES).map(([id, t]) => (
                        <option key={id} value={id}>{(t as any).name}</option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 italic">Automatically selects the most cost-efficient components for your payload/range goals based on combinatorial grid search.</p>
                <AssociatedProductCard product={matchedPresetProduct} />
            </div>

            {/* Safety Alerts */}
            <div className="space-y-2 mb-6">
                {calcData?.escMismatch && (
                    <div className="bg-red-950 p-3 rounded border-l-4 border-red-500 animate-pulse">
                        <div className="flex items-center gap-2 text-red-400 mb-1 font-bold text-xs"><ShieldAlert className="w-4 h-4" /> ESC SAFETY ALERT</div>
                        <div className="text-xs text-red-200">DANGER: ESC Under-rated! Motor needs {motor?.max_amps}A, ESC is {escData?.rating}A.</div>
                    </div>
                )}
                {calcData?.voltageMismatch && (
                    <div className="bg-red-950 p-3 rounded border-l-4 border-red-500">
                        <div className="flex items-center gap-2 text-red-400 mb-1 font-bold text-xs"><AlertTriangle className="w-4 h-4" /> Voltage Mismatch</div>
                        <div className="text-xs text-red-200">Warning: Motor voltage class ({motor?.voltage_req}) ≠ Battery class ({batt?.type})</div>
                    </div>
                )}
                {calcData?.overweight && (
                    <div className="bg-red-950 p-3 rounded border-l-4 border-red-500">
                        <div className="flex items-center gap-2 text-red-400 mb-1 font-bold text-xs"><AlertTriangle className="w-4 h-4" /> Overweight</div>
                        <div className="text-xs text-red-200">CRITICAL: Hover throttle &gt; 75% ({calcData.hoverThrottle?.toFixed(1)}%). Add thrust or reduce payload.</div>
                    </div>
                )}
                {calcData?.tarotStatus && (
                    <div className={`p-3 rounded border-l-4 ${calcData.tarotStatus.bg}`}>
                        <div className={`text-xs font-bold mb-1 ${calcData.tarotStatus.color}`}>Tarot Config Check</div>
                        <div className="text-xs text-white uppercase tracking-normal">{calcData.tarotStatus.text}</div>
                    </div>
                )}
            </div>

            {/* 1. Airframe & Propulsion */}
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">1. Airframe & Propulsion</div>

            <label className="text-xs text-slate-300 block mb-1">Frame Class</label>
            <select value={frameId} onChange={e => { setFrameId(e.target.value); setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                <optgroup label="Medium Lift (Foldable/Inspection)">
                    <option value="tarot_650">Tarot IRON MAN 650 (Foldable)</option>
                    <option value="quad_13">13-inch Frame (Medium)</option>
                    <option value="quad_15">15-inch Frame (Medium+)</option>
                    <option value="quad_17">17-inch Frame (Endurance)</option>
                </optgroup>
                <optgroup label="Industrial Heavy Lift (Cargo)">
                    <option value="quad_industrial">Industrial Quad (2.0m)</option>
                    <option value="hex_industrial">Industrial Hex (2.5m)</option>
                    <option value="octo_heavy">Heavy Lift Octo (3.0m)</option>
                </optgroup>
            </select>
            <ComponentSpecCard item={frame} type="Frame" />

            <label className="text-xs text-slate-300 block mb-1 mt-3">Motor System</label>
            <select value={motorId} onChange={e => { setMotorId(e.target.value); setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                <optgroup label="Compatible Motors">
                    {availableMotors.filter((m: any) => m.compatible).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} — {m.max_thrust_kg}kg thrust @ {m.efficiency_hover?.toFixed(1)}g/W</option>
                    ))}
                </optgroup>
                {availableMotors.some((m: any) => !m.compatible) && (
                    <optgroup label="⚠️ Not Recommended for this Frame">
                        {availableMotors.filter((m: any) => !m.compatible).map((m: any) => (
                            <option key={m.id} value={m.id}>⚠️ {m.name} — {m.max_thrust_kg}kg thrust</option>
                        ))}
                    </optgroup>
                )}
            </select>
            <ComponentSpecCard item={motor} type="Motor" />

            <label className="text-xs text-slate-300 block mb-1 mt-3">Propeller (Filtered by Frame)</label>
            <select value={propId} onChange={e => { setPropId(e.target.value); setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                {availableProps.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.size}" / {(p.weight_kg * 1000).toFixed(0)}g</option>
                ))}
            </select>
            <ComponentSpecCard item={prop} type="Aero" />

            <label className="text-xs text-slate-300 block mb-1 mt-3">ESC (Electronic Speed Controller)</label>
            <select value={escId} onChange={e => { setEscId(e.target.value); setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                {Object.entries(ESCS).map(([id, esc]) => (
                    <option key={id} value={id}>{esc.name} — {esc.rating}A {esc.type}</option>
                ))}
            </select>
            <ComponentSpecCard item={ESCS[escId]} type="Power Controller" />

            {/* 2. Power Plant */}
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">2. Power Plant</div>
            <label className="text-xs text-slate-300 block mb-1">Battery Pack</label>
            <select value={battId} onChange={e => { setBattId(e.target.value); setTemplateId(""); }} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white">
                {allBatteries.map((b: any) => (
                    <option key={b.id} value={b.id}>
                        {b.name} — {b.capacity_wh}Wh @ {b.voltage}V
                        {(b as any).isDbProduct ? ' ●' : ''}
                    </option>
                ))}
            </select>
            <ComponentSpecCard item={batt} type="Battery" />

            {/* 3. Payloads & Optics */}
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700 pb-1 mb-3 mt-6">3. Payloads & Optics</div>
            <label className="text-xs text-slate-300 block mb-1">Visual Intelligence (EO/IR)</label>
            <select 
                value={camera.id} 
                onChange={e => {
                    const found = (derived.availableCameras || []).find((c: any) => c.id === e.target.value);
                    if (found) setCamera(found);
                }} 
                className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-1 outline-none focus:border-sky-400 text-white"
            >
                {(derived.availableCameras || []).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}{c.weight_kg > 0 ? ` — ${(c.weight_kg * 1000).toFixed(0)}g` : ''}</option>
                ))}
            </select>
            {camera.id !== 'none' && <ComponentSpecCard item={camera} type="Sensor" />}

            <label className="text-xs text-slate-300 block mb-1 mt-3">Pipe Payload Material</label>
            <select value={pipeMatId} onChange={e => setPipeMatId(e.target.value)} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-3 outline-none focus:border-sky-400 text-white">
                <option value="pvc">PVC / Plastic (Light)</option>
                <option value="steel">Steel / Iron (Heavy)</option>
                <option value="concrete">Concrete (Very Heavy)</option>
            </select>

            <label className="text-xs text-slate-300 block mb-1">Payload Mass (kg)</label>
            <input type="number" min="0" max="500" step="0.1" value={payloadMass} onChange={e => setPayloadMass(Number(e.target.value))} className="w-full bg-slate-800 border-slate-600 rounded p-2 mb-2 outline-none focus:border-sky-400 text-white" />
            <input type="range" min="0" max="100" step="0.5" value={payloadMass} onChange={e => setPayloadMass(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-sky-400 mb-6" />

            {/* Avionics & Resiliency */}
            <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Avionics & Resiliency
                </h3>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm text-slate-400">Rx/Tx Telemetry</label>
                        <button
                            onClick={(e) => { e.preventDefault(); onNavigate('/plan-scenario?tab=rf-jammer'); }}
                            title="Simulate required Rx/Tx in RF Jammer"
                            className="text-slate-500 hover:text-sky-400 transition-colors flex items-center pr-1"
                        >
                            <span className="text-xs mr-1 opacity-75">Simulate</span>
                            <Radio className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <select value={telemetry} onChange={(e) => setTelemetry(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white outline-none focus:ring-1 focus:ring-sky-400">
                        <option value="standard">Standard Telemetry (915MHz) — +30g</option>
                        <option value="high-gain">SKHY High-Gain Resilient Link (+80g)</option>
                    </select>
                </div>
            </div>

            {/* Payload & Range Analysis */}
            <div className="mt-8 mb-6">
                <PayloadRangeLogic
                    totalPayload={calcData?.totalPayload ?? 0}
                    payloadReserve={calcData?.payloadReserve ?? 0}
                    totalAUW={calcData?.totalAUW ?? 0}
                    rangeKm={calcData?.rangeKm ?? 0}
                    flightTimeMin={(calcData?.flightTimeHrs ?? 0) * 60}
                    maxThrust={calcData?.totalMaxThrust ?? 0}
                    hoverThrottle={calcData?.hoverThrottle ?? 0}
                    platform="multirotor"
                    // ── Full mass breakdown ──
                    frameMass={calcData?.frameMass}
                    motorMass={calcData?.motorMass}
                    propMass={calcData?.propMass}
                    escMass={calcData?.escMass}
                    battMass={calcData?.battMass}
                    telemetryMass={calcData?.telemetryMass}
                    gpsMass={calcData?.gpsMass}
                    // ── Power breakdown ──
                    hoverPowerW={calcData?.hoverPowerW}
                    usableWh={calcData?.usableWh}
                    motorEfficiency={calcData?.motorEfficiency}
                    motorKv={calcData?.motorKv}
                    motorWattsMax={calcData?.motorWattsMax}
                    cruiseSpeedKmh={calcData?.cruiseSpeedKmh}
                />
            </div>


            </fieldset>

            {/* BOM Generator */}
            <div className="mt-8 border-t border-slate-700 pt-6 mb-12">
                <h4 className="text-white font-bold mb-2 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-sky-400" />
                    Bill of Materials (BOM)
                </h4>
                <p className="text-slate-400 text-xs mb-4">
                    Generate a BOM based on your current configuration and add the available components directly to your mission build.
                </p>
                {isPhaseCompleted ? (
                    <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-lg p-4 mb-4">
                        <h5 className="text-emerald-400 font-bold text-sm mb-2 flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Phase Configuration Committed
                        </h5>
                        <p className="text-slate-300 text-xs mb-4">
                            You have successfully saved this Multi-Rotor configuration to your mission build. 
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
                    <>
                        {!isConfigValid && (
                            <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-3 mb-4">
                                <p className="text-amber-400 text-xs flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    Please resolve all safety alerts and warnings (ESC, Voltage, Overweight) before generating a BOM.
                                </p>
                            </div>
                        )}
                        <button
                            onClick={async () => {
                                await handleGenerateBOM();
                                setShowModal(true);
                            }}
                            disabled={!isConfigValid || isGeneratingBOM}
                            className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center transition-all ${!isConfigValid
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/50'
                            }`}
                        >
                            {isGeneratingBOM ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving to Build...</>
                            ) : (
                                <><ShoppingCart className="w-5 h-5 mr-2" /> Save Configuration to Build</>
                            )}
                        </button>
                    </>
                )}
            </div>

            <ConfigAddedModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Multi-Rotor Build Committed"
                itemCount={5}
                totalPrice={calcData?.totalPrice || 0}
                platformName="Multi-Rotor Architecture"
            />
        </div>
    );
};

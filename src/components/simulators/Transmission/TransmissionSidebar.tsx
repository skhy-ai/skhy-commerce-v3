import { Settings, ShieldAlert, Map as MapIcon, Crosshair, ShoppingCart, Monitor, Cpu, Radio, Video, Loader2, Satellite, MessageSquarePlus, Scale } from 'lucide-react';
import { PayloadRangeLogic } from '../Shared/PayloadRangeLogic';
import { RFBand } from '../../../utils/rfUtils';
interface TransmissionSidebarProps {
    state: any;
    controls: any;
    derived: any;
    showBom: boolean;
    setShowBom: (val: boolean) => void;
    droneCalcData?: any;
    platform?: 'multirotor' | 'fixed-wing' | 'rover';
    isCommercialEmail?: boolean;
}

export const TransmissionSidebar: React.FC<TransmissionSidebarProps> = ({ state, controls, derived, showBom, setShowBom, droneCalcData, platform, isCommercialEmail }) => {
    const {
        envFactor, jammerEnabled, activeBandId, bands,
        targetDistKm, altitudeM, ctrlDistKm, relayEnabled,
        relayMode, relayAltKm, relayOffsetKm, relayDepthKm,
        relayPower, selectedGcs, selectedGcsAddon, selectedAirUnit, selectedAirAddon,
        gcsLinkType, isGeneratingBOM
    } = state;

    const {
        setEnvFactor, setJammerEnabled, setActiveBandId, handleBandChange,
        setTargetDistKm, setAltitudeM, setCtrlDistKm, setRelayEnabled,
        setRelayMode, setRelayAltKm, setRelayOffsetKm, setRelayDepthKm,
        setRelayPower, setSelectedGcs, setSelectedAirUnit, setSelectedGcsAddon,
        setSelectedAirAddon, setGcsLinkType, handleGenerateBOM
    } = controls;

    const {
        gcsHw, airHw, gcsAddonHw, airAddonHw,
        availableGcs, availableGcsAddons, availableAirUnits, availableAirAddons,
        rcPower, videoPower, bomTotal
    } = derived;

    return (
        <div className="w-1/2 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-y-auto z-20">
            <div className="p-6 space-y-6">
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
                        takeoffThrustKg={droneCalcData.takeoffThrustKg}
                        cruiseThrustKg={droneCalcData.cruiseThrustKg}
                        landingThrustKg={droneCalcData.landingThrustKg}
                        glideRatio={droneCalcData.glideRatio}
                    />
                )}
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400">
                        <MapIcon className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase">Environment Analysis</h3>
                    </div>
                    <label className="text-xs text-slate-400 block mb-1">Deployment Scenario</label>
                    <select value={envFactor} onChange={e => setEnvFactor(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white outline-none focus:border-cyan-500 mb-4">
                        <option value="2.0">Free Space / Ideal (Vendor Spec)</option>
                        <option value="2.5">Suburban (Trees/Houses)</option>
                        <option value="3.0">Urban (Buildings/Clutter)</option>
                        <option value="3.5">Dense Urban (High Rise)</option>
                    </select>

                    {!isCommercialEmail && (
                        <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <ShieldAlert className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Electronic Warfare</span>
                            </div>
                            <button
                                onClick={() => setJammerEnabled(!jammerEnabled)}
                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${jammerEnabled ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                            >
                                Jammer: {jammerEnabled ? 'ACTIVE' : 'OFF'}
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 text-red-400 mb-4">
                        <Settings className="w-4 h-4" />
                        <h2 className="font-bold uppercase text-xs tracking-wide">Band Configuration</h2>
                    </div>
                    <div className="space-y-2">
                        {bands.map((b: RFBand) => (
                            <div key={b.id} onClick={() => setActiveBandId(b.id)} className={`relative p-3 rounded border transition-all cursor-pointer ${b.id === activeBandId ? 'bg-slate-700 border-red-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`}>
                                <div className="pl-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-white flex items-center gap-2">
                                            {b.id === activeBandId && <Crosshair className="w-3 h-3 text-red-400" />} {b.name} ({b.freq}MHz)
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] text-slate-400 mb-1">Power (W)</div>
                                            <select value={b.power} onChange={e => handleBandChange(b.id, 'power', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-[10px] text-white">
                                                <option value={10}>10 W</option>
                                                <option value={50}>50 W</option>
                                                <option value={100}>100 W</option>
                                                <option value={150}>150 W</option>
                                                <option value={200}>200 W</option>
                                                <option value={300}>300 W</option>
                                            </select>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 mb-1">Gain: {b.gain} dBi</div>
                                            <input type="range" min="0" max="20" step="1" value={b.gain} onChange={e => handleBandChange(b.id, 'gain', Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-slate-400 mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                        <ShieldAlert className="w-4 h-4" />
                        <h2 className="font-bold uppercase text-xs tracking-wide">Target Simulation</h2>
                    </div>
                    <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/20 space-y-4">
                        <div>
                            <div className="flex justify-between mb-1"><label className="text-xs font-medium text-slate-300">Quadcopter Distance</label><span className="text-white font-mono text-xs">{targetDistKm.toFixed(2)} km</span></div>
                            <input type="range" min="0.1" max="10.0" step="0.1" value={targetDistKm} onChange={e => setTargetDistKm(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-slate-400" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1"><label className="text-xs font-medium text-slate-300">Altitude</label><span className="text-white font-mono text-xs">{altitudeM} m</span></div>
                            <input type="range" min="10" max="2000" step="10" value={altitudeM} onChange={e => setAltitudeM(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-cyan-500" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1"><label className="text-xs font-medium text-slate-300">Controller Distance (Tx)</label><span className="text-white font-mono text-xs">{ctrlDistKm.toFixed(1)} km</span></div>
                            <input type="range" min="0.1" max="25.0" step="0.1" value={ctrlDistKm} onChange={e => setCtrlDistKm(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-green-500" />
                        </div>

                        {!isCommercialEmail && (
                            <div className="bg-slate-900/50 p-2 rounded border border-amber-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <Satellite className="w-3 h-3" />
                                        <span className="text-xs font-bold uppercase">Signal Relay</span>
                                    </div>
                                    <button onClick={() => setRelayEnabled(!relayEnabled)} className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold transition-colors ${relayEnabled ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                        {relayEnabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                {relayEnabled && (
                                    <div className="space-y-2 mt-2 border-t border-slate-700 pt-2 text-slate-300">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Relay Type</span>
                                            </div>
                                            <select value={relayMode} onChange={e => setRelayMode(e.target.value as 'fixed-wing' | 'ground')} className="w-full bg-slate-800 border-slate-600 rounded p-1 text-xs text-white">
                                                <option value="fixed-wing">Fixed Wing (High Altitude)</option>
                                                <option value="ground">Ground Node (5m Altitude)</option>
                                            </select>
                                        </div>
                                        {relayMode === 'fixed-wing' && (
                                            <div>
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                    <span>Altitude</span><span className="text-white font-mono">{relayAltKm.toFixed(1)} km</span>
                                                </div>
                                                <input type="range" min="4.0" max="9.0" step="0.1" value={relayAltKm} onChange={e => setRelayAltKm(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Offset from Jammer (X)</span><span className="text-white font-mono">{relayOffsetKm.toFixed(1)} km</span>
                                            </div>
                                            <input type="range" min="0.0" max="10.0" step="0.5" value={relayOffsetKm} onChange={e => setRelayOffsetKm(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Depth from Jammer (Z)</span><span className="text-white font-mono">{relayDepthKm.toFixed(1)} km</span>
                                            </div>
                                            <input type="range" min="-10.0" max="10.0" step="0.5" value={relayDepthKm} onChange={e => setRelayDepthKm(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Relay Power</span><span className="text-white font-mono">{relayPower.toFixed(1)} W</span>
                                            </div>
                                            <input type="range" min="1.0" max="50.0" step="1.0" value={relayPower} onChange={e => setRelayPower(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-t border-slate-700 pt-4 mt-4">
                            <label className="text-xs text-slate-400 block mb-1">GCS Link Technology</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setGcsLinkType('rf')}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase border transition-all ${gcsLinkType === 'rf' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                                >
                                    RF Link
                                </button>
                                <button
                                    onClick={() => setGcsLinkType('fiber')}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase border transition-all ${gcsLinkType === 'fiber' ? 'bg-amber-500 border-amber-400 text-black' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                                >
                                    Fiber Optic
                                </button>
                            </div>
                            {gcsLinkType === 'fiber' && (
                                <p className="text-[9px] text-amber-400 mt-1 italic">Fiber-optic tethers provide immunity to RF jamming at the ground station end.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-6 pb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Settings className="w-4 h-4" />
                            <h2 className="font-bold uppercase text-xs tracking-wide">Hardware Configuration</h2>
                        </div>
                        <button
                            onClick={() => setShowBom(!showBom)}
                            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors border ${showBom ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-purple-500 hover:text-purple-300'}`}
                        >
                            <ShoppingCart className="w-3 h-3" />
                            BOM ${bomTotal.toLocaleString()}
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-2 text-green-400">
                                <Monitor className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase">Main GCS Controller</span>
                            </div>
                            <select value={selectedGcs} onChange={e => setSelectedGcs(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white">
                                {availableGcs.map((o: any) => (
                                    <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 mb-2 mt-4 text-emerald-400">
                                <Radio className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase">GCS Add-ons (Uplink)</span>
                            </div>
                            <select value={selectedGcsAddon} onChange={e => setSelectedGcsAddon(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white">
                                <option value="none">No Add-on</option>
                                {availableGcsAddons.map((o: any) => (
                                    <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                                ))}
                            </select>
                            {gcsAddonHw && (
                                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500">GCS Base: <span className="text-slate-300 font-mono">{(gcsHw?.txPowerW || 0).toFixed(1)}W</span></span>
                                    <span className="text-emerald-400 font-bold">+{(gcsAddonHw.txPowerW || 0).toFixed(1)}W addon → <span className="font-mono">{rcPower.toFixed(2)}W total</span></span>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-2 text-blue-400">
                                <Cpu className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase">Main Air Unit</span>
                            </div>
                            <select value={selectedAirUnit} onChange={e => setSelectedAirUnit(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white">
                                {availableAirUnits.map((o: any) => (
                                    <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 mb-2 mt-4 text-cyan-400">
                                <Video className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase">Video Downlink Add-ons</span>
                            </div>
                            <select value={selectedAirAddon} onChange={e => setSelectedAirAddon(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white">
                                <option value="none">No Add-on</option>
                                {availableAirAddons.map((o: any) => (
                                    <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                                ))}
                            </select>
                            {airAddonHw && (
                                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500">Air Base: <span className="text-slate-300 font-mono">{(airHw?.txPowerW || 0).toFixed(1)}W</span></span>
                                    <span className="text-sky-400 font-bold">+{(airAddonHw.txPowerW || 0).toFixed(1)}W addon → <span className="font-mono">{videoPower.toFixed(2)}W total</span></span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded border bg-green-900/30 border-green-500">
                                <div className="text-[10px] text-slate-300 mb-1 flex items-center gap-1"><Radio className="w-3 h-3" /> GCS RC TX (Up)</div>
                                <div className="text-white font-mono text-xs font-bold">{rcPower.toFixed(2)} W</div>
                            </div>
                            <div className="p-2 rounded border bg-blue-900/30 border-blue-500">
                                <div className="text-[10px] text-slate-300 mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> Air Unit TX (Down)</div>
                                <div className="text-white font-mono text-xs font-bold">{videoPower.toFixed(2)} W</div>
                            </div>
                        </div>

                        {showBom && (
                            <div className="bg-purple-900/10 border border-purple-800/40 rounded-lg p-3">
                                <h4 className="text-purple-400 font-bold text-[10px] uppercase mb-2">Bill of Materials</h4>
                                <div className="space-y-1 text-[10px] text-slate-300">
                                    <div className="flex justify-between"><span>GCS</span><span>${gcsHw?.price}</span></div>
                                    <div className="flex justify-between"><span>GCS Add-on</span><span>${gcsAddonHw?.price || 0}</span></div>
                                    <div className="flex justify-between"><span>Air Unit</span><span>${airHw?.price || 0}</span></div>
                                    <div className="flex justify-between"><span>Air Add-on</span><span>${airAddonHw?.price || 0}</span></div>
                                    <div className="border-t border-slate-700 pt-1 mt-1 flex justify-between font-bold text-white">
                                        <span>Total</span><span>${bomTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateBOM}
                                    disabled={isGeneratingBOM}
                                    className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs flex items-center justify-center"
                                >
                                    {isGeneratingBOM ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShoppingCart className="w-3 h-3 mr-2" />}
                                    Save Configuration to Build
                                </button>
                            </div>
                        )}

                        <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-4 mt-4">
                            <h4 className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                                <MessageSquarePlus className="w-4 h-4" />
                                Custom Configuration
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                                Need higher EIRP, specialized antennas, or custom high-power Rx/Tx (GCS/Drone) not listed in the standard catalog?
                            </p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('OPEN_INTEREST_MODAL', { detail: { product: 'Custom Transmission System' } }))}
                                className="w-full py-2 border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors"
                            >
                                Request Custom RF Design
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

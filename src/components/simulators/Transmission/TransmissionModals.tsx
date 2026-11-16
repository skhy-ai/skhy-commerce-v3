import React from 'react';
import { X, Calculator, HelpCircle } from 'lucide-react';
import { SimulationResult } from '../../../types/simulators/transmission';
import { RFBand } from '../../../utils/rfUtils';

interface CalculationModalProps {
    show: boolean;
    onClose: () => void;
    activeBand: RFBand;
    calcData: SimulationResult;
    rcPower: number;
    videoPower: number;
    altitudeM: number;
    relayEnabled: boolean;
    relayPower: number;
}

export const CalculationModal: React.FC<CalculationModalProps> = ({ 
    show, onClose, activeBand, calcData, rcPower, videoPower, altitudeM, relayEnabled, relayPower 
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Calculator className="w-5 h-5" />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Detailed Calculation Validation</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto font-mono text-sm space-y-6">
                    <div className="mb-6">
                        <h3 className="text-white font-bold border-b border-slate-700 pb-1 mb-2">1. Simulation Parameters</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p><span className="text-slate-400">Frequency:</span> {activeBand.freq} MHz</p>
                                <p><span className="text-slate-400">Jammer Power:</span> {activeBand.power} W ({calcData.jammerPowerDbm.toFixed(1)} dBm)</p>
                                <p><span className="text-slate-400">Jammer Gain:</span> {activeBand.gain} dBi</p>
                                <p><span className="text-slate-400">Env Factor (n):</span> {calcData.envFactor}</p>
                            </div>
                            <div>
                                <p><span className="text-slate-400">Up Tx (GCS):</span> {rcPower} W</p>
                                <p><span className="text-slate-400">Down Tx (Drone):</span> {videoPower} W</p>
                                <p><span className="text-slate-400">Target Altitude:</span> {altitudeM} m</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 bg-red-900/10 p-3 rounded border border-red-900/30">
                        <h3 className="text-red-400 font-bold mb-2">2. Interference Signal (Jammer)</h3>
                        <p className="mb-1"><span className="text-slate-400">Path Up:</span> Jammer &rarr; Quadcopter ({calcData.up.dJammerPath.toFixed(1)} m)</p>
                        <p className="font-bold mb-2">Up Rx Power = <span className="text-white">{calcData.up.jammerRx.toFixed(2)} dBm</span></p>
                        <p className="mb-1"><span className="text-slate-400">Path Down:</span> Jammer &rarr; Controller ({calcData.down.dJammerPath.toFixed(1)} m)</p>
                        <p className="font-bold">Down Rx Power = <span className="text-white">{calcData.down.jammerRx.toFixed(2)} dBm</span></p>
                    </div>

                    <div className="mb-6 bg-green-900/10 p-3 rounded border border-green-900/30">
                        <h3 className="text-green-400 font-bold mb-2">3. Active Link (Direct)</h3>
                        <p className="mb-1"><span className="text-slate-400">Distance (d):</span> {calcData.dCtrl.toFixed(1)} m</p>
                        <p className="font-bold mb-2">Up Rx Power = <span className="text-white">{calcData.up.linkRx.toFixed(2)} dBm</span></p>
                        <p className="font-bold">Down Rx Power = <span className="text-white">{calcData.down.linkRx.toFixed(2)} dBm</span></p>
                    </div>

                    {relayEnabled && (
                        <div className="mb-6 bg-amber-900/10 p-3 rounded border border-amber-900/30">
                            <h3 className="text-amber-400 font-bold mb-2">4. Relay Path Check</h3>
                            <p className="mb-1"><span className="text-slate-400">Re-Tx Power:</span> {relayPower} W</p>
                            <p className="font-bold mb-2">Relay Up Rx Power = <span className="text-white">{calcData.up.relayRx.toFixed(2)} dBm</span></p>
                            <p className="font-bold">Relay Down Rx Power = <span className="text-white">{calcData.down.relayRx.toFixed(2)} dBm</span></p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-white font-bold border-b border-slate-700 pb-1 mb-2">5. Final Validation (SIR)</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-slate-800 rounded text-center">
                                <div className="text-xs text-slate-400 mb-1">UPLINK</div>
                                <div className="text-2xl font-mono font-bold mb-2">
                                    {(calcData.up.bestLinkRx || 0).toFixed(1)} - ({(calcData.up.jammerRx || 0).toFixed(1)}) = <br /><span className={calcData.up.sir < 0 ? 'text-red-500' : 'text-green-500'}>{(calcData.up.sir || 0).toFixed(1)} dB</span>
                                </div>
                                <div className="text-sm">Status: <span className="font-bold">{calcData.up.status || 'N/A'}</span></div>
                            </div>
                            <div className="p-3 bg-slate-800 rounded text-center">
                                <div className="text-xs text-slate-400 mb-1">DOWNLINK</div>
                                <div className="text-2xl font-mono font-bold mb-2">
                                    {(calcData.down.bestLinkRx || 0).toFixed(1)} - ({(calcData.down.jammerRx || 0).toFixed(1)}) = <br /><span className={calcData.down.sir < 0 ? 'text-red-500' : 'text-green-500'}>{(calcData.down.sir || 0).toFixed(1)} dB</span>
                                </div>
                                <div className="text-sm">Status: <span className="font-bold">{calcData.down.status || 'N/A'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PhysicsHelpModalProps {
    show: boolean;
    onClose: () => void;
}

export const PhysicsHelpModal: React.FC<PhysicsHelpModalProps> = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <HelpCircle className="w-5 h-5" />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Simulator Legend & Physics Guide</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
                    <section>
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> System Components</h3>
                        <p><strong>Drone (Blue):</strong> Represented by the quadcopter model. Its color changes based on Uplink status.</p>
                        <p><strong>GCS/Controller (Green):</strong> Represented by the antenna tower. Its color changes based on Downlink status.</p>
                        <p><strong>Jammer (Red):</strong> Static unit emitting interference. Range is determined by Power (W) and Frequency.</p>
                        <p><strong>Relay (Amber):</strong> Can be a Fixed-wing aircraft or a Ground node to extend range.</p>
                    </section>
                    <section>
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> RF Propagation</h3>
                        <p><strong>SIR (Signal-to-Interference Ratio):</strong> The difference between your desired signal and the jammer's noise. A ratio below 0dB means the link is jammed.</p>
                        <p><strong>Path Loss:</strong> Signal weakens over distance based on the environment factor (n). 2.0 is ideal, 3.5 is dense urban.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

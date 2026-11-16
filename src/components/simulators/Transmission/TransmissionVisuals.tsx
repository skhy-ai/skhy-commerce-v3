import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Activity, HelpCircle, Radio, Crosshair } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);
import { SimulationResult } from '../../../types/simulators/transmission';

interface PhysicsGraphProps {
    chartData: any;
    chartOptions: any;
    calcData: SimulationResult;
    activeBandId: number;
    relayEnabled: boolean;
    onShowCalc: () => void;
    onShowHelp: () => void;
}

export const PhysicsGraph: React.FC<PhysicsGraphProps> = ({ chartData, chartOptions, calcData, activeBandId, relayEnabled, onShowCalc, onShowHelp }) => {
    return (
        <div className="absolute bottom-6 left-6 right-6 h-48 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 flex flex-col pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Live Spectrum Analysis</span>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono">
                            <span className="text-slate-400 uppercase">Uplink SIR:</span>
                            <span className={`font-bold ${calcData.up.sir < 0 ? 'text-red-500 animate-pulse' : calcData.up.sir < 5 ? 'text-amber-500' : 'text-green-500'}`}>
                                {calcData.up.sir.toFixed(1)} dB
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono border-l border-slate-700 pl-3">
                            <span className="text-slate-400 uppercase">Downlink SIR:</span>
                            <span className={`font-bold ${calcData.down.sir < 0 ? 'text-red-500 animate-pulse' : calcData.down.sir < 5 ? 'text-amber-500' : 'text-green-500'}`}>
                                {calcData.down.sir.toFixed(1)} dB
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onShowHelp} className="p-1 hover:bg-slate-700 rounded text-slate-400 transition-colors"><HelpCircle className="w-4 h-4" /></button>
                <button onClick={onShowCalc} className="text-[9px] font-bold uppercase text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">
                    View Detailed Physics
                </button>
            </div>
            <div className="flex-1 w-full relative">
                {chartData && (
                    <Line
                        key={`${activeBandId}-${relayEnabled}`}
                        data={chartData}
                        options={chartOptions}
                    />
                )}
            </div>
        </div>
    );
};

interface SimulationOverlayProps {
    calcData: SimulationResult;
}

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({ calcData }) => {
    return (
        <div className="absolute top-6 left-6 pointer-events-none space-y-3">
            <div className={`p-3 rounded border backdrop-blur-md flex flex-col gap-1 transition-all ${calcData.up.status === 'JAMMED' ? 'bg-red-950/40 border-red-500/50' : calcData.up.status === 'UNSTABLE' ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900/40 border-slate-700/50'}`}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Radio className="w-3 h-3" /> GCS &rarr; Drone (Uplink)
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-mono font-bold ${calcData.up.sir < 0 ? 'text-red-500' : calcData.up.sir < 5 ? 'text-amber-500' : 'text-green-500'}`}>{calcData.up.status}</span>
                    <span className="text-[10px] text-slate-500 font-mono">SIR: {calcData.up.sir.toFixed(1)}dB</span>
                </div>
                <div className="flex gap-2 text-[9px] font-mono text-slate-400 uppercase">
                    <span>Rx Link {calcData.up.linkRx.toFixed(1)}dBm</span>
                    <span className="text-slate-600">|</span>
                    <span>Rx Jam: {calcData.up.jammerRx.toFixed(1)}dBm</span>
                </div>
            </div>

            <div className={`p-3 rounded border backdrop-blur-md flex flex-col gap-1 transition-all ${calcData.down.status === 'JAMMED' ? 'bg-red-950/40 border-red-500/50' : calcData.down.status === 'UNSTABLE' ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900/40 border-slate-700/50'}`}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Crosshair className="w-3 h-3" /> Drone &rarr; GCS (Downlink)
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-mono font-bold ${calcData.down.sir < 0 ? 'text-red-500' : calcData.down.sir < 5 ? 'text-amber-500' : 'text-green-500'}`}>{calcData.down.status}</span>
                    <span className="text-[10px] text-slate-500 font-mono">SIR: {calcData.down.sir.toFixed(1)}dB</span>
                </div>
                <div className="flex gap-2 text-[9px] font-mono text-slate-400 uppercase">
                    <span>Rx Link {calcData.down.linkRx.toFixed(1)}dBm</span>
                    <span className="text-slate-600">|</span>
                    <span>Rx Jam: {calcData.down.jammerRx.toFixed(1)}dBm</span>
                </div>
            </div>
        </div>
    );
};

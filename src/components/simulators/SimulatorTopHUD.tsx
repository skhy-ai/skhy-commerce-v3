import React from 'react';
import { ArrowLeft, Target, Cpu, Activity, Clock, Crosshair, Scale, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Metric {
    label: string;
    value: string;
    unit: string;
    icon?: React.ReactNode;
    color?: string; // e.g. "text-sky-400"
}

interface SimulatorTopHUDProps {
    title: string;
    subtitle: string;
    metrics: Metric[];
}

export const SimulatorTopHUD: React.FC<SimulatorTopHUDProps> = ({ title, subtitle, metrics }) => {
    const { isNightMode, toggleNightMode } = useTheme();

    return (
        <div className={`w-full backdrop-blur-md border-b p-2 flex items-center justify-between gap-4 shrink-0 z-50 ${isNightMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
            {/* ── Titles (Compact) ── */}
            <div className={`flex items-center gap-3 px-2 border-r ${isNightMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="bg-sky-500/10 p-1.5 rounded-lg border border-sky-500/20">
                    <Activity className="w-4 h-4 text-sky-500" />
                </div>
                <div>
                    <div className={`font-bold tracking-[1px] uppercase text-[10px] whitespace-nowrap ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest truncate max-w-[200px]">
                        {subtitle}
                    </div>
                </div>
            </div>

            {/* ── Status HUD Blocks (Linear Bar) ── */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
                {metrics.map((m, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-4 py-1 border-r last:border-0 ${isNightMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-1">{m.label}</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-sm font-bold font-mono leading-none ${m.color || (isNightMode ? 'text-white' : 'text-slate-900')}`}>{m.value}</span>
                                <span className="text-[10px] text-slate-500 font-bold leading-none">{m.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── System Status & Theme Toggle ── */}
            <div className={`flex items-center gap-4 px-4 border-l ${isNightMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                    onClick={toggleNightMode}
                    className={`p-1.5 rounded-md transition-colors ${isNightMode ? 'bg-slate-800 hover:bg-slate-700 text-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-indigo-600'}`}
                    title="Toggle Day/Night Mode"
                >
                    {isNightMode ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <div className="hidden lg:flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Nominal</span>
                </div>
            </div>
        </div>
    );
};

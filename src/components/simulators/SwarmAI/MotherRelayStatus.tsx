import React from 'react';
import { Plane, Signal, Battery, Wind, ArrowUpRight } from 'lucide-react';

export const MotherRelayStatus: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Plane className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mother Relay</h3>
            <p className="text-[10px] text-slate-500 font-mono">SKHY-MR-01 [BEYOND]</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
          Active Link
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Altitude
          </span>
          <div className="text-lg font-black text-white">
            12.5<span className="text-xs ml-1 text-slate-400 font-normal">KM</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter flex items-center gap-1">
            <Signal className="w-3 h-3" /> C2 Link
          </span>
          <div className="text-lg font-black text-emerald-400">
            98<span className="text-xs ml-1 text-slate-400 font-normal">%</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter flex items-center gap-1">
            <Battery className="w-3 h-3" /> Endurance
          </span>
          <div className="text-lg font-black text-white">
            18.2<span className="text-xs ml-1 text-slate-400 font-normal">HRS</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter flex items-center gap-1">
            <Wind className="w-3 h-3" /> Bandwidth
          </span>
          <div className="text-lg font-black text-indigo-400">
            1.2<span className="text-xs ml-1 text-slate-400 font-normal">GBPS</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Relay Mesh Load</span>
          <span className="text-[10px] text-indigo-400 font-mono">32%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-[32%] transition-all duration-1000" />
        </div>
      </div>
    </div>
  );
};

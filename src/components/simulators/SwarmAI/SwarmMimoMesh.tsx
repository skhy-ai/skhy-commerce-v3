import React from 'react';
import { Share2, ZapOff, Wifi } from 'lucide-react';

export const SwarmMimoMesh: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Share2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">MIMO Mesh Topology</h3>
            <p className="text-[10px] text-slate-500 font-mono">Resilient Link State</p>
          </div>
        </div>
        <Wifi className="w-4 h-4 text-emerald-500" />
      </div>

      <div className="flex-1 min-h-[120px] relative flex items-center justify-center">
        {/* Simple Abstract Mesh Viz */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-full border border-dashed border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-3/4 h-3/4 border border-dashed border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <ZapOff className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">Jamming Detection</span>
          </div>
          <span className="text-[10px] font-mono text-red-500">BAND_S ACTIVE</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
            <span>Mesh Redundancy</span>
            <span className="text-cyan-400">High (4 paths)</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-[85%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

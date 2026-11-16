import React from 'react';
import { Shield, Zap, Radio, Target, Activity } from 'lucide-react';

export const SwarmSideBanner: React.FC = () => {
  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden relative group">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
        <img 
          src="/images/swarm-ai/side-banner.png" 
          alt="Swarm AI Concept" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              SWARM<span className="text-cyan-400">AI</span>
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-slate-400">
            Tactical C2 Interface v4.0
          </p>
        </div>

        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Mission Profile
            </h3>
            <div className="p-3 bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
              <div className="text-xs font-bold text-white mb-1">Collaborative Airborne Radar</div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                Distributed sensing mesh deployed via Mother Relay. Optimized for contested RF environments.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3 h-3" /> Quick Toggles
            </h3>
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/50 transition-all text-left group/btn">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Initiate Deployment</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/btn:bg-amber-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/50 transition-all text-left group/btn">
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">Radar Sweep</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/btn:bg-cyan-400" />
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">MIMO STATUS:</span>
            <span className="text-emerald-500 font-bold">READY</span>
          </div>
          <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

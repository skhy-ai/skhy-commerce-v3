import React, { useEffect, useState } from 'react';
import { Target, ShieldAlert, Navigation2 } from 'lucide-react';

interface Point {
  id: string;
  x: number;
  y: number;
  type: 'drone' | 'target';
  status?: string;
}

export const TacticalRadar: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([
    { id: 'D1', x: 45, y: 50, type: 'drone' },
    { id: 'D2', x: 55, y: 48, type: 'drone' },
    { id: 'D3', x: 50, y: 58, type: 'drone' },
    { id: 'D4', x: 42, y: 42, type: 'drone' },
    { id: 'T1', x: 20, y: 20, type: 'target', status: 'TRACKING' },
    { id: 'T2', x: 80, y: 75, type: 'target', status: 'IDENTIFIED' },
  ]);

  // Simulated movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => prev.map(p => ({
        ...p,
        x: p.x + (Math.random() - 0.5) * 0.5,
        y: p.y + (Math.random() - 0.5) * 0.5,
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden group">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[10, 30, 50, 70, 90].map(size => (
          <div 
            key={size}
            className="absolute border border-slate-800 rounded-full"
            style={{ width: `${size}%`, height: `${size}%` }}
          />
        ))}
        {/* Radar Sweep Line */}
        <div className="absolute w-[50%] h-[2px] bg-gradient-to-r from-transparent to-cyan-500/40 origin-left animate-[spin_4s_linear_infinite]" 
             style={{ left: '50%', top: '50%' }} />
      </div>

      {/* Points */}
      <div className="absolute inset-0">
        {points.map(p => (
          <div 
            key={p.id}
            className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.type === 'drone' ? (
              <div className="relative">
                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                <div className="absolute -inset-2 bg-cyan-400/20 rounded-full animate-ping" />
              </div>
            ) : (
              <div className="relative">
                <Target className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_#ef4444]" />
                <div className="absolute -inset-1 bg-red-500/10 rounded-full border border-red-500/30 animate-pulse" />
              </div>
            )}
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
              {p.id}
            </span>
          </div>
        ))}
      </div>

      {/* Overlays */}
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700">
          <Navigation2 className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sector A-09</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-6">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 w-48">
          <div className="flex items-center gap-2 mb-3 text-red-400">
            <ShieldAlert className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Threat Detection</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-mono">T1: UAV_MEDIUM</span>
              <span className="text-red-400 font-bold">12 KM</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-mono">T2: UNKNOWN</span>
              <span className="text-amber-400 font-bold">45 KM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

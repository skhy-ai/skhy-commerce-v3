import React from 'react';

const TAU = Math.PI * 2;

export const GaugeArc: React.FC<{ value: number; max: number; label: string; unit: string; color: string }> = ({
  value, max, label, unit, color
}) => {
  const pct = Math.min(value / max, 1);
  const r = 30;
  const circ = TAU * r;
  const dash = pct * circ * 0.75; // 270° sweep
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        {/* Track */}
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth="6" strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeDashoffset={circ * 0.125} strokeLinecap="round"
          style={{ transform: 'rotate(-225deg)', transformOrigin: '36px 36px' }} />
        {/* Fill */}
        <circle cx="36" cy="36" r={r} fill="none" stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-225deg)',
            transformOrigin: '36px 36px',
            filter: `drop-shadow(0 0 4px ${color})`,
            transition: 'stroke-dasharray 0.3s ease',
          }} />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {value}
        </text>
        <text x="36" y="50" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="monospace">
          {unit}
        </text>
      </svg>
      <span className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export const FixedWingHUD: React.FC<{
    ias: number;
    alt: number;
    throttle: number;
    vsi: number;
    hdg: number;
    setThrottle: (val: number) => void;
}> = ({ ias, alt, throttle, vsi, hdg, setThrottle }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            {/* ── Status badge ── */}
            <div className="absolute top-4 left-4 z-20 pointer-events-auto">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-bold text-xs uppercase tracking-widest">Aero-Sim v5.0 // Fixed Wing</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">PUSHER MOTOR · TAIL CONFIG · ACTIVE</p>
            </div>
            </div>

            {/* ── HUD Gauges (top-right) ── */}
            <div className="absolute top-4 right-4 z-20 flex gap-3 pointer-events-auto">
            <GaugeArc value={ias} max={180} label="IAS" unit="kts" color="#38bdf8" />
            <GaugeArc value={throttle} max={100} label="Throttle" unit="%" color="#f59e0b" />
            <GaugeArc value={Math.abs(vsi)} max={500} label="V/S" unit="fpm" color="#a78bfa" />
            </div>

            {/* ── Throttle slider ── */}
            <div className="absolute bottom-24 right-4 z-20 flex flex-col items-center gap-2 pointer-events-auto">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Throttle</span>
            <input type="range" min={0} max={100} value={throttle}
                onChange={e => setThrottle(Number(e.target.value))}
                className="h-24 accent-amber-400 cursor-pointer pointer-events-auto"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }} />
            <span className="text-xs font-mono font-bold text-amber-400">{throttle}%</span>
            </div>

            {/* ── Bottom telemetry strip ── */}
            <div className="absolute bottom-4 left-4 z-20 flex gap-3 flex-wrap pointer-events-auto">
            {[
                { label: 'ALT', value: `${alt.toLocaleString()} ft`, color: 'text-sky-400' },
                { label: 'HDG', value: `${String(hdg).padStart(3, '0')}°`, color: 'text-sky-400' },
                { label: 'V/S', value: `${vsi > 0 ? '+' : ''}${vsi} fpm`, color: vsi > 0 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'L/D', value: '18:1', color: 'text-purple-400' },
            ].map(({ label, value, color }) => (
                <div key={label}
                className="bg-slate-900/80 border border-white/5 backdrop-blur rounded-lg px-3 py-2">
                <span className="block text-[9px] text-slate-500 uppercase tracking-widest">{label}</span>
                <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
                </div>
            ))}
            </div>

            {/* ── Propulsion indicator ── */}
            <div className="absolute top-40 left-4 z-20 pointer-events-auto">
            <div className="bg-slate-900/80 border border-amber-500/20 backdrop-blur rounded-lg px-3 py-2 w-fit">
                <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-1">Pusher RPM</span>
                <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"
                    style={{ animation: `fw3d-spin-indicator ${Math.max(0.1, 0.8 - throttle * 0.006)}s linear infinite` }} />
                <span className="text-sm font-bold font-mono text-amber-400">
                    {Math.round(throttle * 52 + 800)} RPM
                </span>
                </div>
            </div>
            </div>

            <style>{`
            @keyframes fw3d-spin-indicator {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            `}</style>
        </div>
    );
};

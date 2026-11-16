import React, { useState } from 'react';
import { Clock, AlertTriangle, Plus, Trash2, Pencil } from 'lucide-react';
import { ThreatZone, THREAT_SPEEDS_KMH, calcETA, fmtETA } from './CUASPerimeterMap';

interface Props {
  radiusKm: number;
  setRadiusKm: (r: number) => void;
  zones: ThreatZone[];
  setZones: React.Dispatch<React.SetStateAction<ThreatZone[]>>;
  selectedThreat: string;
  setSelectedThreat: (t: string) => void;
  threatDirection: string;
  setThreatDirection: (d: string) => void;
}

export const MapSettingsPanel: React.FC<Props> = ({
  radiusKm, setRadiusKm,
  zones, setZones,
  selectedThreat, setSelectedThreat,
  threatDirection, setThreatDirection
}) => {
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const updateZone = (id: string, patch: Partial<ThreatZone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...patch } : z));
  };
  const addZone = () => setZones(prev => [
    ...prev, { id: `z-${Date.now()}`, label: 'Custom Zone', radiusKm: 50, color: '#06b6d4', threat: 'Custom action' }
  ]);
  const removeZone = (id: string) => setZones(prev => prev.filter(z => z.id !== id));

  const inp = "px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      {/* ── Radius slider ── */}
      <div className="p-4 bg-slate-900/50 border border-white/8 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            Protected / Hard-Deny Area Radius
          </label>
          <span className="text-blue-400 font-mono font-bold">{radiusKm} km</span>
        </div>
        <input type="range" min={1} max={500} step={1} value={radiusKm}
          onChange={e => setRadiusKm(parseFloat(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer" />
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>1 km</span><span>100 km</span><span>250 km</span><span>500 km</span>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Coverage ≈ {(Math.PI * radiusKm * radiusKm / (threatDirection === 'Omni' ? 1 : 2)).toFixed(0)} km²
        </p>
      </div>

      {/* ── Threat Direction ── */}
      <div className="p-4 bg-slate-900/50 border border-white/8 rounded-xl space-y-2">
        <label className="text-xs font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
          Threat Vector Direction
        </label>
        <select 
          value={threatDirection} 
          onChange={e => setThreatDirection(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-xs focus:border-blue-500"
        >
          <option value="Omni">Omnidirectional (360°)</option>
          <option value="North">North Sector (180°)</option>
          <option value="East">East Sector (180°)</option>
          <option value="South">South Sector (180°)</option>
          <option value="West">West Sector (180°)</option>
        </select>
        <p className="text-[10px] text-slate-500">
          Focuses sensor coverage and threat zones towards a specific ingress vector.
        </p>
      </div>

      {/* ── Threat ETA Matrix — always visible ── */}
      <div className="p-4 bg-slate-900/50 border border-white/8 rounded-xl space-y-3 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Threat ETA Matrix
          </h4>
        </div>
        <p className="text-[10px] text-slate-500">
          Time from boundary to center. Click a row to select the threat profile for the map.
        </p>

        <table className="w-full text-left border-collapse min-w-[400px]">
          <thead>
            <tr>
              <th className="p-2 border-b border-white/10 text-[10px] font-bold text-slate-400 whitespace-nowrap">Threat Type</th>
              {[...zones].sort((a, b) => b.radiusKm - a.radiusKm).map(z => (
                <th key={z.id} className="p-2 border-b border-white/10 text-[10px] font-bold whitespace-nowrap" style={{ color: z.color }}>
                  {z.label}<br/>
                  <span className="text-slate-500 font-normal">{z.radiusKm} km</span>
                </th>
              ))}
              <th className="p-2 border-b border-white/10 text-[10px] font-bold text-blue-400 whitespace-nowrap">
                Protected<br/>
                <span className="text-slate-500 font-normal">{radiusKm} km</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(THREAT_SPEEDS_KMH).map(([threatName, speedKmh]) => (
              <tr 
                key={threatName} 
                onClick={() => setSelectedThreat(threatName)}
                className={`border-b border-white/5 cursor-pointer transition-colors ${selectedThreat === threatName ? 'bg-red-500/15 border-red-500/30' : 'hover:bg-white/5'}`}
              >
                <td className="p-2 text-[10px] text-slate-300 font-medium whitespace-nowrap">
                  {threatName} <span className="text-slate-500">({speedKmh} km/h)</span>
                </td>
                {[...zones].sort((a, b) => b.radiusKm - a.radiusKm).map(z => (
                  <td key={z.id} className="p-2 text-xs font-mono text-amber-400/80">
                    {fmtETA(calcETA(z.radiusKm, speedKmh))}
                  </td>
                ))}
                <td className="p-2 text-xs font-mono font-bold text-amber-400">
                  {fmtETA(calcETA(radiusKm, speedKmh))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Zone ring editor ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" /> Threat Zone Rings
          </h4>
          <button type="button" onClick={addZone}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
            <Plus className="w-3 h-3" /> Add Ring
          </button>
        </div>
        {zones.map(zone => (
          <div key={zone.id} className="p-3 rounded-xl border border-white/5 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: zone.color }} />
              {editingLabel === zone.id ? (
                <input autoFocus type="text" value={zone.label}
                  onChange={e => updateZone(zone.id, { label: e.target.value })}
                  onBlur={() => setEditingLabel(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingLabel(null); }}
                  className={inp + ' flex-1'} />
              ) : (
                <button type="button" onClick={() => setEditingLabel(zone.id)}
                  className="flex-1 text-left text-xs font-bold text-white flex items-center gap-1.5 hover:text-red-300 transition-colors">
                  {zone.label} <Pencil className="w-2.5 h-2.5 text-slate-600" />
                </button>
              )}
              <input type="color" value={zone.color}
                onChange={e => updateZone(zone.id, { color: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0" />
              <button type="button" onClick={() => removeZone(zone.id)}
                className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={500} step={1} value={zone.radiusKm}
                onChange={e => updateZone(zone.id, { radiusKm: parseFloat(e.target.value) })}
                style={{ accentColor: zone.color }} className="flex-1 cursor-pointer" />
              <span className="text-[11px] font-mono font-bold w-16 text-right" style={{ color: zone.color }}>
                {zone.radiusKm} km
              </span>
            </div>
            <input type="text" value={zone.threat}
              onChange={e => updateZone(zone.id, { threat: e.target.value })}
              className={inp + ' w-full'} placeholder="Action at this range" />
          </div>
        ))}
        <p className="text-[10px] text-slate-600">Hover over rings on map to preview ETA. All zone data included in quote.</p>
      </div>
    </>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapSearchPanel } from './MapSearchPanel';
import { MapSettingsPanel } from './MapSettingsPanel';

export interface LatLng { lat: number; lng: number; }

export interface ThreatZone {
  id: string;
  label: string;
  radiusKm: number;
  color: string;
  threat: string;
  etaSeconds?: number;
}

export const THREAT_SPEEDS_KMH: Record<string, number> = {
  'Commercial COTS Drone':    72,
  'Fixed-Wing / Loitering':  150,
  'Swarm UAS':                60,
  'Fiber-Optic Tethered':    40,
  'GPS-Denied Drone':        50,
  'Night Ops Drone':         55,
};

const DEFAULT_ZONES: ThreatZone[] = [
  { id: 'detection', label: 'Detection Ring',  radiusKm: 150, color: '#facc15', threat: 'Early Warning — horizon-range UAS detection' },
  { id: 'warning',   label: 'Warning Ring',    radiusKm: 80,  color: '#f97316', threat: 'Elevated Alert — track, classify & cue intercept' },
  { id: 'engage',    label: 'Engagement Ring', radiusKm: 30,  color: '#ef4444', threat: 'High Threat — intercept authorised' },
];

export const calcETA = (distKm: number, speedKmh: number) =>
  Math.round((distKm / speedKmh) * 3600);

export const fmtETA = (s: number) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
};

const generateWedgePoints = (center: L.LatLng, radiusKm: number, direction: string): L.LatLng[] => {
  if (direction === 'Omni') return [];
  const dirMap: Record<string, number> = { North: 0, East: 90, South: 180, West: 270 };
  const baseAngle = dirMap[direction] ?? 0;
  const points: L.LatLng[] = [center];
  const arcSpan = 180; 
  const startAngle = baseAngle - arcSpan / 2;
  const steps = 32;

  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (i / steps) * arcSpan;
    const rad = a * Math.PI / 180;
    const lat = center.lat + (radiusKm / 111) * Math.cos(rad);
    const lng = center.lng + (radiusKm / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(rad);
    points.push(L.latLng(lat, lng));
  }
  return points;
};

interface Props {
  onPolygonChange: (coords: LatLng[], areaSqKm: number, zones: ThreatZone[], direction: string) => void;
  externalLocation?: LatLng | null;
}

export const CUASPerimeterMap: React.FC<Props> = ({ onPolygonChange, externalLocation }) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const circleRef     = useRef<L.Layer | null>(null);
  const markerRef     = useRef<L.CircleMarker | null>(null);
  const zoneRingsRef  = useRef<L.Layer[]>([]);
  
  // Use a ref for the callback to prevent infinite effect loops when parent re-renders
  const onPolygonChangeRef = useRef(onPolygonChange);

  const [center, setCenter]                 = useState<L.LatLng | null>(null);
  const [radiusKm, setRadiusKm]             = useState(5);
  const [zones, setZones]                   = useState<ThreatZone[]>(DEFAULT_ZONES);
  const [selectedThreat, setSelectedThreat] = useState('Commercial COTS Drone');
  const [threatDirection, setThreatDirection] = useState('Omni');

  // Sync latest callback to ref
  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange;
  }, [onPolygonChange]);

  // 1. Map init (Runs strictly once per mount)
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    
    const map = L.map(containerRef.current, {
      zoomControl: true, attributionControl: false,
    }).setView([20, 0], 3);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    mapRef.current = map;

    let destroyed = false;
    const t = setTimeout(() => {
      if (destroyed || !mapRef.current) return;
      map.invalidateSize();
      setCenter(map.getCenter());
    }, 350);

    return () => {
      destroyed = true;
      clearTimeout(t);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      circleRef.current = null;
      markerRef.current = null;
      zoneRingsRef.current = [];
    };
  }, []);

  // 2. Map drawing (Pure effect, runs only when dependencies change)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;

    if (circleRef.current) map.removeLayer(circleRef.current);
    if (markerRef.current) map.removeLayer(markerRef.current);
    zoneRingsRef.current.forEach(c => map.removeLayer(c));
    zoneRingsRef.current = [];

    // Main protection area
    if (threatDirection === 'Omni') {
      circleRef.current = L.circle(center, {
        radius: radiusKm * 1000,
        color: '#3b82f6', weight: 2.5, fillColor: '#3b82f6', fillOpacity: 0.1,
      }).addTo(map);
    } else {
      circleRef.current = L.polygon(generateWedgePoints(center, radiusKm, threatDirection), {
        color: '#3b82f6', weight: 2.5, fillColor: '#3b82f6', fillOpacity: 0.1,
      }).addTo(map);
    }

    // Center marker
    markerRef.current = L.circleMarker(center, {
      radius: 7, color: '#3b82f6', weight: 2.5, fillColor: '#3b82f6', fillOpacity: 0.5,
    }).addTo(map);

    // Zone rings (biggest first)
    const sortedZones = [...zones].sort((a, b) => b.radiusKm - a.radiusKm);
    
    sortedZones.forEach(z => {
      const eta = calcETA(z.radiusKm, THREAT_SPEEDS_KMH[selectedThreat] || 70);
      const tooltipHTML = `<b>${z.label}</b><br/>${z.radiusKm} km | ETA: ${fmtETA(eta)}<br/><em>${z.threat}</em>`;
      
      let layer;
      if (threatDirection === 'Omni') {
        layer = L.circle(center, {
          radius: z.radiusKm * 1000,
          color: z.color, weight: 1.5, fillColor: z.color, fillOpacity: 0.06, dashArray: '8 4',
        });
      } else {
        layer = L.polygon(generateWedgePoints(center, z.radiusKm, threatDirection), {
          color: z.color, weight: 1.5, fillColor: z.color, fillOpacity: 0.06, dashArray: '8 4',
        });
      }
      
      layer.bindTooltip(tooltipHTML, { sticky: true, opacity: 0.95 }).addTo(map);
      zoneRingsRef.current.push(layer as any);
    });

  }, [center, radiusKm, zones, selectedThreat, threatDirection]);

  // 3. Sync to Parent (Separated from drawing to avoid recursive updates)
  useEffect(() => {
    if (!center) return;
    
    const area = threatDirection === 'Omni' ? Math.PI * radiusKm * radiusKm : (Math.PI * radiusKm * radiusKm) / 2;
    const pts: LatLng[] = threatDirection === 'Omni'
      ? Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * 2 * Math.PI;
          return {
            lat: center.lat + (radiusKm / 111) * Math.cos(a),
            lng: center.lng + (radiusKm / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(a),
          };
        })
      : generateWedgePoints(center, radiusKm, threatDirection).map(p => ({ lat: p.lat, lng: p.lng }));
    
    const enrichedZones = zones.map(z => ({
      ...z, 
      etaSeconds: calcETA(z.radiusKm, THREAT_SPEEDS_KMH[selectedThreat] || 70),
    }));

    onPolygonChangeRef.current(pts, area, enrichedZones, threatDirection);
  }, [center, radiusKm, zones, selectedThreat, threatDirection]);

  // Handle external location changes
  useEffect(() => {
    if (externalLocation && mapRef.current) {
      const latlng = L.latLng(externalLocation.lat, externalLocation.lng);
      const maxRadius = Math.max(radiusKm, ...zones.map(z => z.radiusKm));
      const offset = (maxRadius * 1.1) / 111; 
      const bounds = L.latLngBounds(
        [externalLocation.lat - offset, externalLocation.lng - offset],
        [externalLocation.lat + offset, externalLocation.lng + offset]
      );
      mapRef.current.flyToBounds(bounds, { duration: 1, padding: [20, 20] });
      const t = setTimeout(() => {
        if (mapRef.current) setCenter(latlng);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [externalLocation, radiusKm, zones]);

  return (
    <div className="space-y-4">
      {/* ── Map + overlays ───────────────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden border border-white/10">

        {/* Leaflet map */}
        <div ref={containerRef} style={{ height: 340, background: '#0f172a' }} />
      </div>

      <p className="text-[10px] text-slate-500">
        Search a location above to automatically place a protection zone, or use your current location.
      </p>

      <MapSettingsPanel 
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        zones={zones}
        setZones={setZones}
        selectedThreat={selectedThreat}
        setSelectedThreat={setSelectedThreat}
        threatDirection={threatDirection}
        setThreatDirection={setThreatDirection}
      />
    </div>
  );
};


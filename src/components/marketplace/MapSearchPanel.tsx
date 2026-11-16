import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
  onNameSelect?: (name: string) => void;
  standalone?: boolean;
  initialValue?: string;
}

export const MapSearchPanel: React.FC<Props> = ({ onLocationSelect, onNameSelect, standalone, initialValue = '' }) => {
  const [searchQuery, setSearchQuery]       = useState(initialValue);
  const [searchResults, setSearchResults]   = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [searching, setSearching]           = useState(false);
  const [gpsLoading, setGpsLoading]         = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (onNameSelect) onNameSelect(q);
    setSearchResults([]);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (q.trim().length < 3) return;
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        setSearchResults(await r.json());
      } catch { /* silent */ } finally { setSearching(false); }
    }, 500);
  };

  const flyToResult = (r: { display_name: string; lat: string; lon: string }) => {
    onLocationSelect(parseFloat(r.lat), parseFloat(r.lon));
    const name = r.display_name.split(',').slice(0, 2).join(', ');
    setSearchQuery(name);
    if (onNameSelect) onNameSelect(name);
    setSearchResults([]);
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      fallbackToIpLocation();
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onLocationSelect(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      err => {
        console.warn('[Geolocation] GPS lookup failed, attempting IP fallback:', err);
        fallbackToIpLocation();
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  const fallbackToIpLocation = async () => {
    setGpsLoading(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          onLocationSelect(data.latitude, data.longitude);
          return;
        }
      }
    } catch (e) {
      console.warn('[Geolocation] IP fallback failed:', e);
    } finally {
      setGpsLoading(false);
    }
    // Final robust fallback to SKHY AI Malaysia HQ
    onLocationSelect(3.0333, 101.7000);
  };

  return (
    <div className={standalone ? "relative w-full flex items-center gap-2" : "absolute top-2 left-2 right-2 z-[1000] flex items-start gap-2"}>
      <div className={`relative ${standalone ? 'flex-1' : 'flex-1'}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin pointer-events-none" />}
        <input
          type="text" value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search base, city, region…"
          className={`w-full pl-8 pr-8 py-3 bg-navy-900 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors ${!standalone ? 'bg-slate-900/95 shadow-xl text-xs py-2' : ''}`}
          onKeyDown={e => { if (e.key === 'Escape') { setSearchResults([]); setSearchQuery(''); } }}
        />
        {searchResults.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden divide-y divide-white/5 max-h-60 overflow-y-auto">
            {searchResults.map((r, i) => (
              <li key={i}>
                <button type="button" onClick={() => flyToResult(r)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-red-500/10 hover:text-white transition-colors flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{r.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" onClick={goToMyLocation} title="Use my location"
        className={`flex-shrink-0 flex items-center justify-center rounded-xl bg-navy-900 border border-white/10 text-slate-400 hover:text-white hover:border-red-500/40 transition ${standalone ? 'w-[46px] h-[46px]' : 'w-9 h-9 bg-slate-900/95 shadow-xl'}`}>
        {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
      </button>
    </div>
  );
};

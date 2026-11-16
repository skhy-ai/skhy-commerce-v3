import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CUASPerimeterMap, ThreatZone } from './CUASPerimeterMap';
import { MapSearchPanel } from './MapSearchPanel';
import { submitOrderConfirmation } from '../../services/web3formsService';
import {
  Shield, Radio, AlertCircle, CheckCircle, Copy,
  ArrowRight, Info, RefreshCw, Sparkles, FileText,
  Building2, Globe, Lock, StickyNote, Cpu, Zap,
  Map, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LatLng { lat: number; lng: number; }
interface CUASQuoteFormProps { onClose?: () => void; }

const SENSOR_OPTIONS = [
  { id: 'rf', label: 'RF / Direction-Finding', desc: 'Passive RF spectrum monitoring, drone protocol decode' },
  { id: 'acoustic', label: 'Acoustic Array', desc: 'Microphone array for rotor signature detection' },
  { id: 'radar', label: 'Radar (mm-Wave/FMCW)', desc: 'Active detection up to 5 km, all-weather' },
  { id: 'eoir', label: 'EO/IR Camera', desc: 'Electro-optical + thermal imaging for visual ID' },
  { id: 'adsb', label: 'ADS-B / Mode-S Receiver', desc: 'Cooperative track of transponder-equipped UAS' },
  { id: 'lidar', label: 'LiDAR Scanner', desc: '3D point-cloud for low, slow, small targets' },
];

const THREAT_TYPES = [
  'Commercial Off-The-Shelf (COTS) Drones',
  'Fixed-Wing / Loitering Munitions',
  'Swarm UAS (Multiple simultaneous)',
  'Fiber-Optic Tethered UAS',
  'Autonomous / GPS-Denied Drones',
  'Night / Low-Visibility Operations',
  'All of the above',
];

const INTERCEPTION_METHODS = [
  { id: 'rf_jamming', label: 'RF Jamming / Spoofing' },
  { id: 'net_gun', label: 'Net-Gun Interceptor' },
  { id: 'laser', label: 'High-Energy Laser (HEL)' },
  { id: 'kinetic', label: 'Kinetic / Hard-Kill' },
  { id: 'autonomous_uav', label: 'Autonomous Counter-UAS Drone' },
];

const L: React.FC<{ text: string; optional?: boolean }> = ({ text, optional }) => (
  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
    {text}{optional && <span className="ml-1 text-slate-600 normal-case font-normal"> (optional)</span>}
  </label>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div>
    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
      <span className="text-red-400">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

export const CUASQuoteForm: React.FC<CUASQuoteFormProps> = ({ onClose }) => {
  const { user, signUp } = useAuth();

  // Perimeter
  const [perimeterCoords, setPerimeterCoords] = useState<LatLng[]>([]);
  const [areaSqKm, setAreaSqKm] = useState(0);
  const [threatZones, setThreatZones] = useState<ThreatZone[]>([]);
  const [threatDirection, setThreatDirection] = useState('Omni');
  const [siteName, setSiteName] = useState('');
  const [siteType, setSiteType] = useState('Military Base / Forward Operating Base');
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);

  // Sensors
  const [selectedSensors, setSelectedSensors] = useState<string[]>(['rf', 'acoustic']);
  const sensorCount = 4;

  // Threats
  const [threats, setThreats] = useState<string[]>(['Commercial Off-The-Shelf (COTS) Drones']);

  // Interception
  const [needsInterception, setNeedsInterception] = useState<boolean | null>(null);
  const [interceptMethods, setInterceptMethods] = useState<string[]>([]);

  // Integration
  const [needsC2, setNeedsC2] = useState(true);
  const integrations: string[] = [];
  const [alertResponse, setAlertResponse] = useState('Automated alert + human confirmation');

  // Contact
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [secLevel, setSecLevel] = useState('Unclassified');
  const [budget, setBudget] = useState('N/A – Prefer not to disclose');
  const [notes, setNotes] = useState('');
  const [deployTimeline, setDeployTimeline] = useState('Standard (1-3 months)');

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [orderNum, setOrderNum] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const genPass = () => {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    return 'SkhyAI-' + Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSensors.length === 0) { setError('Select at least one sensor type.'); return; }
    if (threats.length === 0) { setError('Select at least one threat type.'); return; }
    setLoading(true); setError(null);

    try {
      let userId = user?.id;
      let isNew = false;
      let pass = '';

      if (!user) {
        if (!email) throw new Error('Email is required.');
        pass = genPass();
        const { error: signUpErr } = await signUp(email, pass, {
          full_name: contactName || 'C-UAS Procurement',
          user_type: 'customer',
        });
        if (signUpErr) throw new Error(signUpErr.message || 'Auto-registration failed.');
        await new Promise(r => setTimeout(r, 1500));
        const { data: ud } = await supabase.from('users').select('user_id').eq('email', email.toLowerCase()).maybeSingle();
        if (!ud) throw new Error('Account created but profile not found. Please log in and retry.');
        userId = ud.user_id; isNew = true;
      }

      const num = `ORD-CUAS-${Math.floor(100000 + Math.random() * 900000)}`;
      const notesText = [
        `C-UAS Network Procurement Request`,
        `─────────────────────────────────────`,
        `Site Name     : ${siteName || siteType}`,
        `Site Type     : ${siteType}`,
        `Country       : ${country}`,
        `Perimeter     : ${perimeterCoords.length} vertices | ~${areaSqKm.toFixed(2)} km² coverage`,
        `Threat Vector : ${threatDirection}`,
        `Threat Zones  : ${threatZones.map(z => `${z.label} ${z.radiusKm}km`).join(', ') || 'Default rings'}`,
        `─────────────────────────────────────`,
        `Sensors       : ${selectedSensors.join(', ')} (×${sensorCount} nodes)`,
        `Threat Types  : ${threats.join('; ')}`,
        `Interception  : ${needsInterception === null ? 'TBD' : needsInterception ? interceptMethods.join(', ') || 'Yes (methods TBD)' : 'Not Required'}`,
        `C2 Platform   : ${needsC2 ? 'Yes — SKHY Threat Awareness Manager' : 'No'}`,
        `Alert Mode    : ${alertResponse}`,
        `Integration   : ${integrations.join(', ') || 'None specified'}`,
        `Deploy ETA    : ${deployTimeline}`,
        `Classification: ${secLevel}`,
        `Budget        : ${budget}`,
        perimeterCoords.length > 0 ? `GeoJSON Coords: ${JSON.stringify(perimeterCoords)}` : '',
        `─────────────────────────────────────`,
        `Notes:\n${notes || 'None'}`,
      ].join('\n');

      try {
        const { data: order, error: oErr } = await supabase.from('orders').insert({
          buyer_id: userId,
          order_number: num,
          total_amount: 0,
          status: 'pending',
          shipping_address: { name: orgName || 'C-UAS Lead', line1: 'To Be Configured', city: country, country, phone: '---' },
          shipping_amount: 0, tax_amount: 0,
          notes: notesText,
          shipping_method: 'Custom Installation',
          payment_method: 'bank_transfer',
        }).select().single();
        
        if (oErr) throw oErr;

        // Attempt order_locations insert
        if (perimeterCoords && perimeterCoords.length > 0) {
          const { error: locErr } = await supabase.from('order_locations').insert({
            order_id: order.id,
            location_name: siteName || siteType || 'C-UAS Protection Area',
            location_type: siteType || 'protected_area',
            coordinates: perimeterCoords,
            area_sq_km: areaSqKm,
            threat_zones: threatZones,
            threat_direction: threatDirection,
          });
          if (locErr) console.warn('[Supabase] failed to create order_locations record:', locErr);
        }

        // Attempt order_items insert
        const { error: iErr } = await supabase.from('order_items').insert({
          order_id: order.id,
          product_name: `C-UAS Network: ${siteName || siteType}`,
          quantity: sensorCount,
          unit_price: 0, total_price: 0,
          product_metadata: {
            is_custom_quote: true, type: 'cuas_network',
            sensors: selectedSensors, threats, needsInterception,
            interceptMethods, siteType, areaSqKm,
            perimeterCoords, country, secLevel, budget, threatZones,
            threatDirection,
          },
        });
        if (iErr) console.warn('[Supabase] failed to create order_items record:', iErr);

        setOrderNum(order.order_number || num);
      } catch (dbError) {
        console.warn('[Supabase] Database order insert failed, falling back to Web3Forms only pipeline:', dbError);
        setOrderNum(num);
      }

      // Submit to Web3Forms for immediate email confirmation
      try {
        await submitOrderConfirmation({
          orderNumber: num,
          customerEmail: email || user?.email || '',
          customerName: contactName || orgName || 'C-UAS Procurement Lead',
          orderType: 'cuas_network',
          details: notesText,
        });
      } catch (w3Err) {
        console.warn('[Web3Forms] notification failed:', w3Err);
      }

      if (isNew) { setTempPassword(pass); setRegisteredEmail(email); }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sc = "w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors text-sm";
  const ic = "w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors text-sm placeholder-slate-600";

  if (success) return (
    <div className="bg-navy-900 border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl">
      <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-extrabold text-white mb-2">C-UAS Design Submitted!</h2>
      <p className="text-slate-400 mb-6 max-w-lg mx-auto">
        Your custom Counter-UAS network design and security specifications have been compiled. A copy of the confirmation has been dispatched.
      </p>

      {/* Spaced details box */}
      <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 text-left mb-6 max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-slate-400 text-xs">Order Reference</span>
          <span className="text-sky-400 font-mono font-bold text-sm select-all">{orderNum}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Site Type</span>
            <span className="text-white font-semibold truncate block">{siteName || siteType}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Deploy Country</span>
            <span className="text-white font-semibold truncate block">{country}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Protection Area</span>
            <span className="text-white font-semibold block">{areaSqKm > 0 ? `${areaSqKm.toFixed(2)} km²` : 'Not Drawn'}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Threat Vector</span>
            <span className="text-white font-semibold block">{threatDirection}</span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-3">
          <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-1">Selected Sensor Layers</span>
          <p className="text-white text-xs font-medium leading-relaxed">
            {selectedSensors.map(s => SENSOR_OPTIONS.find(o => o.id === s)?.label).join(', ')} (×{sensorCount} nodes)
          </p>
        </div>
      </div>

      {tempPassword && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6 text-left max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Track Account Created
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Email</span><span className="text-white">{registeredEmail}</span></div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Temp Password</span>
              <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded-lg border border-white/5 mt-1">
                <span className="text-sky-400 font-mono font-bold select-all">{tempPassword}</span>
                <button onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success('Copied!'); }}>
                  <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-amber-500 mt-4 flex items-center gap-1 font-semibold">
            <Info className="w-3.5 h-3.5" /> Please check your SPAM / JUNK folder for the verification email to activate tracking!
          </p>
        </div>
      )}

      {/* Spam Reminder block for existing users too */}
      {!tempPassword && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-6 max-w-md mx-auto flex items-start gap-2.5 text-left text-[11px] text-amber-400/90 leading-normal">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            An email confirmation with details has been dispatched. Please check your <strong>Spam or Junk folder</strong> if you do not see it in your inbox within 2 minutes.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/marketplace/orders" className="px-6 py-3 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-650 hover:to-orange-550 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg">
          Track Quote <ArrowRight className="w-4 h-4" />
        </a>
        <button onClick={() => { setSuccess(false); setTempPassword(''); onClose?.(); }} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 font-medium transition">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <section className="bg-navy-950 border border-red-500/15 rounded-3xl p-6 md:p-10 shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Shield className="w-3.5 h-3.5" /> C-UAS Network Design
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Wide-Area Counter-UAS Quote</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Configure your sensor layers, threat profiles, and interception requirements. Optionally attach a map perimeter — all fields can be left blank.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Organisation ── */}
          <Section icon={<Building2 className="w-4 h-4" />} title="Organisation & Contact">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><L text="Organisation / Agency" /><input required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Ministry of Defence" className={ic} /></div>
              <div><L text="Point of Contact" optional /><input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" className={ic} /></div>
              <div><L text="Country / Region" /><input required value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Ukraine" className={ic} /></div>
            </div>
            <div className="mt-4">
              <L text="Procurement Contact Email" />
              <input type="email" required disabled={!!user} value={email} onChange={e => setEmail(e.target.value)} placeholder="name@agency.gov" className={ic + (user ? ' opacity-50 cursor-not-allowed' : '')} />
              {!user && <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-blue-400" /> A tracking account will be created automatically.</p>}
            </div>
          </Section>

          {/* ── Site & Perimeter ── */}
          <Section icon={<Globe className="w-4 h-4" />} title="Site & Perimeter Definition">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <L text="Site Name / Location Search" />
                <MapSearchPanel 
                  standalone 
                  initialValue={siteName}
                  onNameSelect={(name) => setSiteName(name)} 
                  onLocationSelect={(lat, lng) => {
                    setMapCenter({ lat, lng });
                    setShowMap(true);
                  }} 
                />
              </div>
              <div><L text="Site Type" />
                <select value={siteType} onChange={e => setSiteType(e.target.value)} className={sc}>
                  <option>Military Base / Forward Operating Base</option>
                  <option>Airport / Airfield</option>
                  <option>Critical Infrastructure (Power Plant, Dam)</option>
                  <option>Port / Maritime Facility</option>
                  <option>Government / VIP Compound</option>
                  <option>Border / Perimeter Corridor</option>
                  <option>Urban Area / Smart City</option>
                  <option>Event / Temporary Deployment</option>
                </select>
              </div>
            </div>
            {/* Optional map toggle */}
            <div className="border border-white/8 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMap(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white/3 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {showMap
                    ? <EyeOff className="w-4 h-4 text-slate-400" />
                    : <Map className="w-4 h-4 text-red-400" />}
                  <div className="text-left">
                    <span className="text-sm font-bold text-white block">
                      {showMap ? 'Hide Map Perimeter' : 'Add Map Perimeter'}
                      <span className="ml-2 text-[10px] font-normal text-slate-500 uppercase tracking-wider">Optional</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {showMap
                        ? 'Click to collapse — location data is optional'
                        : 'Visually define your protection zone on a map. Skip if you prefer not to share location details.'}
                    </span>
                  </div>
                </div>
                {showMap
                  ? <ChevronUp className="w-4 h-4 text-slate-500" />
                  : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showMap && (
                <div className="p-4 border-t border-white/5">
                  <CUASPerimeterMap
                    externalLocation={mapCenter}
                    onPolygonChange={(coords, area, zones, direction) => {
                      setPerimeterCoords(coords);
                      setAreaSqKm(area);
                      setThreatZones(zones);
                      if (direction) setThreatDirection(direction);
                    }}
                  />
                  {areaSqKm > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span className="text-emerald-400 font-bold">✓ Perimeter captured:</span>
                      <span className="text-white font-mono">{areaSqKm.toFixed(2)} km²</span>
                      <span className="text-slate-500">· {perimeterCoords.length} points</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* ── Sensors ── */}
          <Section icon={<Radio className="w-4 h-4" />} title="Sensor Layer Configuration">
            <p className="text-xs text-slate-500 mb-4">Select all sensor modalities required for your C-UAS network (multi-layered fusion recommended).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {SENSOR_OPTIONS.map(s => (
                <button key={s.id} type="button" onClick={() => toggleArr(selectedSensors, s.id, setSelectedSensors)}
                  className={`text-left p-3 rounded-xl border transition-colors ${selectedSensors.includes(s.id) ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-navy-900 border-white/5 text-slate-400 hover:border-white/15'}`}>
                  <span className="font-bold text-sm block">{selectedSensors.includes(s.id) ? '✓ ' : ''}{s.label}</span>
                  <span className="text-[10px] opacity-70">{s.desc}</span>
                </button>
              ))}
            </div>
            <div className="p-3 bg-sky-500/8 border border-sky-500/15 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                <span className="text-sky-300 font-bold">Sensor node count is estimated by our engineers</span> based on your protection area, terrain, and selected sensor mix.
                Request for access to <span className="text-white font-semibold">SKHY Threat Awareness Manager</span> for interactive deployment planning with precise sensor coverage visualisation.
              </p>
            </div>

          </Section>

          {/* ── Threats ── */}
          <Section icon={<AlertCircle className="w-4 h-4" />} title="Threat Profile">
            <p className="text-xs text-slate-500 mb-3">Select all UAS threat categories relevant to your operational environment.</p>
            <div className="flex flex-wrap gap-2">
              {THREAT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => toggleArr(threats, t, setThreats)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${threats.includes(t) ? 'bg-orange-500/15 border-orange-500/30 text-orange-300' : 'bg-navy-900 border-white/5 text-slate-400 hover:border-white/15'}`}>
                  {threats.includes(t) ? '✓ ' : ''}{t}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Interception ── */}
          <Section icon={<Zap className="w-4 h-4" />} title="Interception Requirement">
            <p className="text-xs text-slate-500 mb-3">Does this deployment require active countermeasures beyond detection and tracking?</p>
            <div className="flex gap-3 mb-4">
              {([true, false] as const).map(v => (
                <button key={String(v)} type="button" onClick={() => setNeedsInterception(v)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${needsInterception === v ? v ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-slate-700 border-white/10 text-slate-300' : 'bg-navy-900 border-white/5 text-slate-500 hover:border-white/10'}`}>
                  {v ? '⚡ Yes — Active Interception Required' : '○  Detection & Tracking Only'}
                </button>
              ))}
            </div>
            {needsInterception && (
              <div>
                <L text="Preferred Interception Methods" optional />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {INTERCEPTION_METHODS.map(m => (
                    <button key={m.id} type="button" onClick={() => toggleArr(interceptMethods, m.id, setInterceptMethods)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${interceptMethods.includes(m.id) ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-navy-900 border-white/5 text-slate-400 hover:border-white/15'}`}>
                      {interceptMethods.includes(m.id) ? '✓ ' : ''}{m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ── C2 & Integration ── */}
          <Section icon={<Cpu className="w-4 h-4" />} title="Command & Control Integration">
            <div className="flex items-center justify-between p-4 bg-navy-900 border border-white/10 rounded-xl mb-4">
              <div>
                <span className="text-sm font-bold text-white block">SKHY Threat Awareness Manager</span>
                <span className="text-[10px] text-slate-500">AI-fused real-time C2 dashboard, fusion tracking, alert management</span>
              </div>
              <button type="button" onClick={() => setNeedsC2(!needsC2)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${needsC2 ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                {needsC2 ? 'Required' : 'Not Required'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><L text="Desired Alert Response Mode" />
                <select value={alertResponse} onChange={e => setAlertResponse(e.target.value)} className={sc}>
                  <option>Automated alert + human confirmation</option>
                  <option>Fully autonomous response</option>
                  <option>Alert-only, no automated action</option>
                  <option>Classified — discuss separately</option>
                </select>
              </div>
              <div><L text="Deployment Timeline" />
                <select value={deployTimeline} onChange={e => setDeployTimeline(e.target.value)} className={sc}>
                  <option>Urgent (&lt; 1 month)</option>
                  <option>Standard (1-3 months)</option>
                  <option>Planning (&gt; 3 months)</option>
                  <option>Flexible – No fixed timeline</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ── Operational Context ── */}
          <Section icon={<Lock className="w-4 h-4" />} title="Operational Context">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><L text="Classification Level" optional />
                <select value={secLevel} onChange={e => setSecLevel(e.target.value)} className={sc}>
                  <option>Unclassified</option><option>Confidential</option><option>Secret</option>
                  <option>Top Secret</option><option>Restricted (National Use)</option>
                  <option value="N/A">N/A – Commercial</option>
                </select>
              </div>
              <div><L text="Estimated Budget Range" optional />
                <select value={budget} onChange={e => setBudget(e.target.value)} className={sc}>
                  <option value="N/A – Prefer not to disclose">N/A – Prefer not to disclose</option>
                  <option>Under $500k USD</option><option>$500k – $2M USD</option>
                  <option>$2M – $10M USD</option><option>$10M – $50M USD</option>
                  <option>$50M+ USD (National Programme)</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ── Notes ── */}
          <Section icon={<StickyNote className="w-4 h-4" />} title="Additional Notes">
            <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Terrain constraints, existing infrastructure, interoperability requirements (NATO STANAG, Link 16), EW environment, legal constraints, or anything else our engineering team should know..." className={ic + ' resize-none'} />
          </Section>

          {/* ── Submit ── */}
          <div className="flex flex-col items-center gap-3">
            <button type="submit" disabled={loading}
              className="w-full max-w-md py-4 bg-gradient-to-r from-red-700 to-orange-600 hover:shadow-[0_15px_40px_rgba(239,68,68,0.3)] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting…</> : <><FileText className="w-4 h-4" /> Request C-UAS Engineering Quote <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-[10px] text-slate-500 text-center max-w-sm">Our C-UAS engineering panel will review your configuration and reply within 2–5 business days.</p>
          </div>
        </form>
      </div>
    </section>
  );
};

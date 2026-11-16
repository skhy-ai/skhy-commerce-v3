import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { submitOrderConfirmation } from '../../services/web3formsService';
import {
  Shield, Cpu, Sparkles, CheckCircle, Copy,
  ArrowRight, Info, AlertCircle, RefreshCw, Building2,
  User, Globe, Radio, Lock, Package, FileText, StickyNote
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkOrderFormProps {
  onClose?: () => void;
}

export const BulkOrderForm: React.FC<BulkOrderFormProps> = ({ onClose }) => {
  const { user, signUp } = useAuth();

  // ── Core Drone Specs ─────────────────────────────────────────────────
  const [droneType, setDroneType]         = useState('Fixed Wing');
  const [purpose, setPurpose]             = useState('ISR (Intelligence, Surveillance, and Reconnaissance)');
  const [endurance, setEndurance]         = useState('1-3 hours');
  const [payload, setPayload]             = useState<string>('5.5');      // string so "N/A" is valid
  const [payloadType, setPayloadType]     = useState('Optical/Thermal Gimbal');
  const [kevlar, setKevlar]               = useState<boolean>(true);
  const [gcs, setGcs]                     = useState('Ruggedized Laptop GCS');
  const [rf, setRf]                       = useState('Anti-Jamming Mesh Network');
  const [units, setUnits]                 = useState<number>(5);
  const [deliveryTime, setDeliveryTime]   = useState('Standard (1-3 months)');

  // ── Customer / Org Details ────────────────────────────────────────────
  const [orgName, setOrgName]             = useState('');
  const [contactName, setContactName]     = useState('');
  const [email, setEmail]                 = useState('');
  const [country, setCountry]             = useState('');
  const [opEnvironment, setOpEnvironment] = useState('Desert / Arid');
  const [secLevel, setSecLevel]           = useState('Unclassified');
  const [budgetRange, setBudgetRange]     = useState('$250k – $1M USD');
  const [notes, setNotes]                 = useState('');

  // ── UI States ─────────────────────────────────────────────────────────
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [regSuccess, setRegSuccess]       = useState(false);
  const [tempPassword, setTempPassword]   = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [createdOrderNum, setCreatedOrderNum] = useState('');

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
    let pass = 'SkhyAI-';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    toast.success('Temporary password copied!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalUserId = user?.id;
      let isNewUser   = false;
      let generatedPass = '';

      if (!user) {
        if (!email) throw new Error('Please provide an email address for registration and tracking.');
        generatedPass = generateTempPassword();

        const { error: signUpError } = await signUp(email, generatedPass, {
          full_name: contactName || 'Bulk Order Customer',
          user_type: 'customer',
        });
        if (signUpError) throw new Error(`Auto-registration failed: ${signUpError.message || 'Email may already be in use.'}`);

        await new Promise(r => setTimeout(r, 1500));

        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (userFetchError || !userData)
          throw new Error('Account created but failed to bind quote. Please log in and try again.');

        finalUserId = userData.user_id;
        isNewUser   = true;
      }

      if (!finalUserId) throw new Error('Unable to bind quote to a verified user profile.');

      const orderNum = `ORD-QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;

      const buildNotes = [
        `Bulk Custom Quote Request`,
        `──────────────────────────────`,
        `Organisation : ${orgName || 'N/A'}`,
        `Contact Name : ${contactName || 'N/A'}`,
        `Country      : ${country || 'N/A'}`,
        `Op. Env.     : ${opEnvironment}`,
        `Security Lvl : ${secLevel}`,
        `Budget Range : ${budgetRange}`,
        `──────────────────────────────`,
        `Drone Type   : ${droneType}`,
        `Purpose      : ${purpose}`,
        `Endurance    : ${endurance}`,
        `Payload Cap. : ${payload} kg`,
        `Payload Type : ${payloadType}`,
        `Kevlar Shield: ${kevlar ? 'Yes' : 'No'}`,
        `GCS Setup    : ${gcs}`,
        `RF Comms     : ${rf}`,
        `Units        : ${units}`,
        `Desired ETA  : ${deliveryTime}`,
        `──────────────────────────────`,
        `Additional Notes:`,
        notes || 'None',
      ].join('\n');

      let dbSuccess = false;
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: finalUserId,
            order_number: orderNum,
            total_amount: 0,
            status: 'pending',
            shipping_address: {
              name: contactName || 'Bulk Order Lead',
              line1: 'To Be Configured',
              city: country,
              country,
              phone: '---',
            },
            shipping_amount: 0,
            tax_amount: 0,
            notes: buildNotes,
            shipping_method: 'Custom Cargo',
            payment_method: 'bank_transfer',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create a generic locations entry so standard geo queries work
        const { error: locError } = await supabase
          .from('order_locations')
          .insert({
            order_id: order.id,
            location_name: country || 'Procurement Headquarters',
            location_type: 'procurement_destination',
            coordinates: [],
            area_sq_km: 0,
            threat_zones: [],
            threat_direction: 'Omni',
          });
        if (locError) console.warn('[Supabase] Failed to write bulk order_locations:', locError);

        const { error: itemError } = await supabase.from('order_items').insert({
          order_id: order.id,
          product_name: `Custom Build: ${droneType} – ${purpose}`,
          quantity: units,
          unit_price: 0,
          total_price: 0,
          product_metadata: {
            endurance, payload, payloadType, purpose, droneType,
            kevlar: kevlar ? 'Yes' : 'No', gcs, rf, deliveryTime, orgName, contactName,
            country, opEnvironment, secLevel, budgetRange, notes,
            is_custom_quote: true,
          },
        });

        if (itemError) throw itemError;
        dbSuccess = true;
        setCreatedOrderNum(order.order_number || orderNum);
      } catch (dbErr) {
        console.warn('[Supabase] Database order insert failed, falling back to Web3Forms only pipeline:', dbErr);
        setCreatedOrderNum(orderNum);
      }

      // Web3Forms direct email dispatch
      try {
        await submitOrderConfirmation({
          orderNumber: orderNum,
          customerEmail: email || user?.email || '',
          customerName: contactName || orgName || 'Bulk Drone Customer',
          orderType: 'bulk_procurement',
          details: buildNotes,
        });
      } catch (w3Err) {
        console.warn('[Web3Forms] notification failed:', w3Err);
      }

      if (isNewUser) { setTempPassword(generatedPass); setRegisteredEmail(email); }
      setRegSuccess(true);

    } catch (err: any) {
      console.error('Bulk Quote Error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────
  if (regSuccess) {
    return (
      <div className="bg-navy-900 border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">Procurement Quote Submitted!</h2>
        <p className="text-slate-400 mb-6">
          Your custom drone design specification has been captured. A support engineer will verify your bulk payload payload calculations.
        </p>

        {/* Detailed specifications card */}
        <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 text-left mb-6 max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-slate-400 text-xs">Reference Number</span>
            <span className="text-sky-400 font-mono font-bold text-sm select-all">{createdOrderNum}</span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Drone Type</span>
              <span className="text-white font-semibold truncate block">{droneType}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Requested Fleet</span>
              <span className="text-white font-semibold truncate block">{units} Units</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Payload Cap.</span>
              <span className="text-white font-semibold block">{payload} kg</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Endurance</span>
              <span className="text-white font-semibold block">{endurance}</span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-3">
            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-1">Payload Config</span>
            <p className="text-white text-xs font-medium leading-relaxed">
              {payloadType} · {kevlar ? 'Kevlar Shielding Active' : 'No Kevlar Shielding'}
            </p>
          </div>
          <div className="border-t border-white/5 pt-3">
            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-1">RF Comms & GCS</span>
            <p className="text-white text-xs font-medium leading-relaxed">
              {rf} · {gcs}
            </p>
          </div>
        </div>

        {tempPassword && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Secure Account Created
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              A customer tracking account has been provisioned. Sign in to view system design updates and payload diagnostics.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Sign-in Email</span>
                <span className="text-white font-medium">{registeredEmail}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Temporary Password</span>
                <div className="flex items-center justify-between mt-1 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                  <span className="text-sky-400 font-mono font-bold text-sm select-all">{tempPassword}</span>
                  <button onClick={handleCopyPassword} className="text-slate-400 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-amber-500 mt-4 flex items-center gap-1 font-semibold">
              <Info className="w-3.5 h-3.5 shrink-0" /> Please inspect your SPAM / JUNK folder for the verification email to activate tracking!
            </p>
          </div>
        )}

        {/* Spam Reminder block for existing users too */}
        {!tempPassword && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-8 max-w-md mx-auto flex items-start gap-2.5 text-left text-[11px] text-amber-400/90 leading-normal">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              An email confirmation with details has been dispatched. Please check your <strong>Spam or Junk folder</strong> if you do not see it in your inbox within 2 minutes.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a href="/marketplace/orders" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 rounded-2xl text-white font-bold transition flex items-center justify-center gap-2 shadow-lg">
            Track Quote on Dashboard <ArrowRight className="w-5 h-5" />
          </a>
          <button
            onClick={() => { setRegSuccess(false); setTempPassword(''); onClose?.(); }}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }


  // ── Field helpers ──────────────────────────────────────────────────────
  const Label: React.FC<{ icon: React.ReactNode; text: string; optional?: boolean }> = ({ icon, text, optional }) => (
    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
      <span className="text-sky-400">{icon}</span> {text}
      {optional && <span className="ml-1 text-slate-600 normal-case font-normal tracking-normal">(optional)</span>}
    </label>
  );

  const selectCls = "w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors text-sm";
  const inputCls  = "w-full px-4 py-3 bg-navy-900 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors text-sm placeholder-slate-600";

  // ── Main Form ──────────────────────────────────────────────────────────
  return (
    <section className="bg-navy-950 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Cpu className="w-3.5 h-3.5" /> High-Capacity Procurement
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Bulk Order &amp; Engineering Quote
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Specify your mission requirements. Fields marked <span className="text-slate-500">(optional)</span> can be left as <strong className="text-slate-400">N/A</strong> if not applicable. Our panel will reach out within 2–5 business days.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Section 1: Organisation ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Building2 className="w-4 h-4 text-sky-400" /> Organisation &amp; Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label icon={<Building2 className="w-3 h-3" />} text="Organisation / Agency" />
                <input required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Ministry of Defence" className={inputCls} />
              </div>
              <div>
                <Label icon={<User className="w-3 h-3" />} text="Point of Contact" optional />
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <Label icon={<Globe className="w-3 h-3" />} text="Country / Region" />
                <input required value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Malaysia" className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <Label icon={<Lock className="w-3 h-3" />} text="Procurement Contact Email" />
              <input
                type="email" required
                disabled={!!user}
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@agency.gov"
                className={inputCls + (user ? ' opacity-50 cursor-not-allowed' : '')}
              />
              {!user && (
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  A secure customer account will be created automatically for order tracking.
                </p>
              )}
            </div>
          </div>

          {/* ── Section 2: Platform Spec ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Cpu className="w-4 h-4 text-sky-400" /> Drone Platform Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label icon={<Package className="w-3 h-3" />} text="Platform Type" />
                <select value={droneType} onChange={e => setDroneType(e.target.value)} className={selectCls}>
                  <option>Fixed Wing</option>
                  <option>Delta Wing</option>
                  <option>Multirotor</option>
                  <option>Fiber Optic Tethered</option>
                </select>
              </div>

              <div>
                <Label icon={<FileText className="w-3 h-3" />} text="Operational Purpose" />
                <select value={purpose} onChange={e => setPurpose(e.target.value)} className={selectCls}>
                  <option>ISR (Intelligence, Surveillance, and Reconnaissance)</option>
                  <option>Border Patrol</option>
                  <option>Agricultural Mapping</option>
                  <option>Commercial Delivery</option>
                  <option>Search &amp; Rescue</option>
                  <option>Infrastructure Inspection</option>
                  <option>EW / Electronic Warfare Support</option>
                  <option>Custom Tactical Operation</option>
                </select>
              </div>

              <div>
                <Label icon={<Cpu className="w-3 h-3" />} text="Target Endurance" optional />
                <select value={endurance} onChange={e => setEndurance(e.target.value)} className={selectCls}>
                  <option value="N/A">N/A – Not yet determined</option>
                  <option>Up to 1 hour</option>
                  <option>1-3 hours</option>
                  <option>3-6 hours</option>
                  <option>6 hours+</option>
                </select>
              </div>

              <div>
                <Label icon={<Package className="w-3 h-3" />} text="Payload Capacity (KG)" optional />
                <div className="relative">
                  <select
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                    className={selectCls}
                  >
                    <option value="N/A">N/A – No payload / TBD</option>
                    <option value="0.5">0.5 kg</option>
                    <option value="1">1 kg</option>
                    <option value="2">2 kg</option>
                    <option value="5">5 kg</option>
                    <option value="10">10 kg</option>
                    <option value="20">20 kg</option>
                    <option value="50">50 kg</option>
                    <option value="100+">100 kg+</option>
                  </select>
                </div>
              </div>

              <div>
                <Label icon={<Package className="w-3 h-3" />} text="Payload Hardware Type" optional />
                <select value={payloadType} onChange={e => setPayloadType(e.target.value)} className={selectCls}>
                  <option value="N/A">N/A – No payload</option>
                  <option>Optical/Thermal Gimbal</option>
                  <option>LiDAR Scanner</option>
                  <option>Multi-Spectral Camera</option>
                  <option>EO/IR Dual Sensor</option>
                  <option>SAR (Synthetic Aperture Radar)</option>
                  <option>Cargo Release Mechanism</option>
                  <option>Custom Tactical Payload</option>
                </select>
              </div>

              <div>
                <Label icon={<Radio className="w-3 h-3" />} text="Ground Control Station (GCS)" optional />
                <select value={gcs} onChange={e => setGcs(e.target.value)} className={selectCls}>
                  <option value="N/A">N/A – Not required / Using own GCS</option>
                  <option>Handheld GCS</option>
                  <option>Ruggedized Laptop GCS</option>
                  <option>Multi-Screen Tactical Command Station</option>
                  <option>Dual-Operator GCS</option>
                  <option>Man-Packable Backpack GCS</option>
                </select>
              </div>

              <div>
                <Label icon={<Radio className="w-3 h-3" />} text="RF / Comms Link" optional />
                <select value={rf} onChange={e => setRf(e.target.value)} className={selectCls}>
                  <option value="N/A">N/A – Using own comms infrastructure</option>
                  <option>Standard LoS (Line of Sight)</option>
                  <option>BLOS SatCom (Beyond Line of Sight)</option>
                  <option>Anti-Jamming Mesh Network</option>
                  <option>Encrypted Tactical Link</option>
                  <option>Fiber Optic Tether (Zero RF)</option>
                </select>
              </div>

              <div>
                <Label icon={<Package className="w-3 h-3" />} text="Number of Units" />
                <input
                  type="number" min="1" max="10000" required
                  value={units} onChange={e => setUnits(parseInt(e.target.value) || 1)}
                  className={inputCls}
                />
              </div>

            </div>

            {/* Kevlar Toggle */}
            <div className="mt-4">
              <Label icon={<Shield className="w-3 h-3" />} text="Tactical Kevlar Armor Shell" optional />
              <div className="flex gap-3">
                {([true, false] as const).map(opt => (
                  <button
                    key={String(opt)}
                    type="button"
                    onClick={() => setKevlar(opt)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${
                      kevlar === opt
                        ? opt
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-navy-900 border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    {opt ? '✓ Required' : '✗ Not Required'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Lightweight physical resilience against kinetic and fragmentation hazards</p>
            </div>

            <div className="mt-4">
              <Label icon={<Package className="w-3 h-3" />} text="Requested Delivery ETA" />
              <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className={selectCls}>
                <option>Urgent (&lt; 1 month)</option>
                <option>Standard (1-3 months)</option>
                <option>Planning (&gt; 3 months)</option>
                <option>Flexible – No fixed timeline</option>
              </select>
            </div>
          </div>

          {/* ── Section 3: Operational Context ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Globe className="w-4 h-4 text-sky-400" /> Operational Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label icon={<Globe className="w-3 h-3" />} text="Operating Environment" optional />
                <select value={opEnvironment} onChange={e => setOpEnvironment(e.target.value)} className={selectCls}>
                  <option value="N/A">N/A – Not yet defined</option>
                  <option>Desert / Arid</option>
                  <option>Maritime / Littoral</option>
                  <option>Arctic / Cold Weather</option>
                  <option>Jungle / Humid Tropical</option>
                  <option>Urban / Dense Infrastructure</option>
                  <option>High Altitude (&gt; 4,000 m)</option>
                  <option>Mixed / Multi-Domain</option>
                </select>
              </div>
              <div>
                <Label icon={<Lock className="w-3 h-3" />} text="Classification Level" optional />
                <select value={secLevel} onChange={e => setSecLevel(e.target.value)} className={selectCls}>
                  <option>Unclassified</option>
                  <option>Confidential</option>
                  <option>Secret</option>
                  <option>Top Secret</option>
                  <option>Restricted (National Use)</option>
                  <option value="N/A">N/A – Commercial project</option>
                </select>
              </div>
              <div>
                <Label icon={<FileText className="w-3 h-3" />} text="Estimated Budget Range" optional />
                <select value={budgetRange} onChange={e => setBudgetRange(e.target.value)} className={selectCls}>
                  <option value="N/A">N/A – Prefer not to disclose</option>
                  <option>Under $100k USD</option>
                  <option>$100k – $250k USD</option>
                  <option>$250k – $1M USD</option>
                  <option>$1M – $5M USD</option>
                  <option>$5M – $20M USD</option>
                  <option>$20M+ USD (Government / Defence Program)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 4: Notes ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <StickyNote className="w-4 h-4 text-sky-400" /> Special Requirements &amp; Notes
            </h3>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe mission constraints, interoperability requirements (NATO STANAG, MIL-STD), existing fleet details, integration needs, or anything else our engineering team should know..."
              className={inputCls + ' resize-none'}
            />
          </div>

          {/* ── Submit ── */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-md py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_15px_40px_rgba(14,165,233,0.3)] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 uppercase tracking-wider text-sm border border-sky-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting Quote Request…</>
              ) : (
                <><FileText className="w-4 h-4" /> Request Engineering Quote <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center max-w-sm">
              Our engineering panel will review your configuration and reply within 2–5 business days.
            </p>
          </div>

        </form>
      </div>
    </section>
  );
};

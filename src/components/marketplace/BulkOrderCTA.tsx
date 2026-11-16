import React, { useState, Suspense, lazy } from 'react';
import { Users, ArrowRight, Wrench, Globe, ShieldCheck } from 'lucide-react';

const BulkOrderForm = lazy(() => import('./BulkOrderForm').then(m => ({ default: m.BulkOrderForm })));

// Pexels-hosted drone builder images (CSP-approved: images.pexels.com)
const DRONE_BUILDER_IMAGES = [
  {
    src: 'https://i.ibb.co/Lz3VM34Y/Screenshot-2026-05-02-010558.png?auto=compress&cs=tinysrgb&w=800',
    alt: 'Engineer assembling drone components in a lab',
  },
  {
    src: 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Drone technician testing electronics on a workbench',
  },
  {
    src: 'https://i.ibb.co/qF1m82hM/Screenshot-2026-05-03-111322.png?auto=compress&cs=tinysrgb&w=800',
    alt: 'Team working on UAV frame assembly',
  },
];

const STATS = [
  { icon: <Users className="w-5 h-5" />, value: '40+', label: 'Certified Builders' },
  { icon: <Globe className="w-5 h-5" />, value: '12', label: 'Countries Served' },
  { icon: <ShieldCheck className="w-5 h-5" />, value: '100%', label: 'Quality Certified' },
];

export const BulkOrderCTA: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── Invitation Card ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-navy-950/60 backdrop-blur-lg shadow-[0_0_80px_-20px_rgba(14,165,233,0.12)]">

        {/* Image strip */}
        <div className="grid grid-cols-3 h-52 overflow-hidden">
          {DRONE_BUILDER_IMAGES.map((img) => (
            <div key={img.src} className="relative overflow-hidden">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover brightness-50 hover:brightness-60 transition-all duration-500 scale-105 hover:scale-100"
                loading="lazy"
              />
            </div>
          ))}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/40 to-navy-950/95 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative px-8 pb-10 pt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
            <Wrench className="w-3.5 h-3.5" /> Network of Drone Builders
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
            Want to bulk order drones?<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Connect to our network of drone builders.
            </span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
            Tap into SKHY AI's vetted manufacturing partners to deploy fully-customised tactical, commercial, or ISR drone fleets — built to your exact mission spec.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 flex flex-col items-center gap-1">
                <span className="text-sky-400">{s.icon}</span>
                <span className="text-xl font-extrabold text-white">{s.value}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{s.label}</span>
              </div>
            ))}
          </div>

          <button
            id="bulk-order-open-btn"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_15px_40px_rgba(14,165,233,0.35)] text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 uppercase tracking-wider text-sm border border-sky-400/20"
          >
            <Wrench className="w-5 h-5" />
            Bulk Order Drones
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-4 pt-10 pb-20"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="relative w-full max-w-4xl">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 right-0 z-10 w-9 h-9 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition flex items-center justify-center text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>

            <Suspense fallback={
              <div className="h-64 flex items-center justify-center text-slate-400">
                Loading form…
              </div>
            }>
              <BulkOrderForm onClose={() => setIsOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
};

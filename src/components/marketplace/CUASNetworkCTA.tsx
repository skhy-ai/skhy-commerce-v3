import React, { useState, useEffect } from 'react';
import { Radio, ArrowRight, Shield, Globe, Cpu, Radar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CUASQuoteForm } from './CUASQuoteForm';

// CSP-approved sources: /images/ (self) + images.pexels.com
const CUAS_IMAGES = [
  {
    src: '/images/threat_awareness_manager.png',
    alt: 'SKHY Threat Awareness Manager dashboard',
    title: 'Threat Awareness Manager',
    desc: 'Real-time multi-sensor fusion command and control interface',
  },
  {
    src: 'https://i.ibb.co/sdqMvbHs/acoustic-RF-sensor-with-metal-telescopic-mast.png',
    alt: 'SKHY MOBISENSE Acoustic & RF sensor with telescopic mast',
    title: 'Passive RF Threat Trackers',
    desc: 'Multi-band RF spectrum analyzers and SKHY MOBISENSE sensor nodes',
  },
  {
    src: 'https://cdn.shopify.com/s/files/1/0774/4330/1668/files/2_a053b9c4-7fd7-4e1e-80d4-8f36e58e0e99.webp?auto=compress&cs=tinysrgb&w=800',
    alt: 'Acasom high-power GaN anti-drone tripod tactical jammer array',
    title: 'Tripod Tactical Radar & Jammer Arrays',
    desc: 'Micro-doppler radar systems with Acasom GaN anti-drone jammer modules',
  },
];

const STATS = [
  { icon: <Radio className="w-5 h-5" />,  value: '360°', label: 'Sensor Coverage' },
  { icon: <Globe className="w-5 h-5" />,  value: '<2s',  label: 'Threat Alert Time' },
  { icon: <Shield className="w-5 h-5" />, value: '150km+', label: 'Detection Range' },
];

export const CUASNetworkCTA: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % CUAS_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ── Invitation Card ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-red-500/15 bg-navy-950/60 backdrop-blur-lg shadow-[0_0_80px_-20px_rgba(239,68,68,0.12)] animate-fade-in">

        {/* Interactive Image Slider */}
        <div className="relative h-64 overflow-hidden group">
          {CUAS_IMAGES.map((img, idx) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === activeIdx ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover brightness-[0.45] transition-transform duration-10000 ease-out scale-100 group-hover:scale-105"
                loading="lazy"
              />
              {/* Slide text details overlays */}
              <div className="absolute bottom-6 left-6 right-6 text-left z-10 pointer-events-none">
                <span className="text-[10px] uppercase font-mono tracking-widest text-red-500 font-extrabold block mb-1">
                  Tactical Component
                </span>
                <h4 className="text-white font-extrabold text-lg drop-shadow-md">
                  {img.title}
                </h4>
                <p className="text-slate-300 text-xs mt-0.5 drop-shadow">
                  {img.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-navy-950/20 to-navy-950 pointer-events-none" />

          {/* Left Arrow */}
          <button
            onClick={() => setActiveIdx((prev) => (prev - 1 + CUAS_IMAGES.length) % CUAS_IMAGES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 text-white transition flex items-center justify-center opacity-0 group-hover:opacity-100"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => setActiveIdx((prev) => (prev + 1) % CUAS_IMAGES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 text-white transition flex items-center justify-center opacity-0 group-hover:opacity-100"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/20 px-2 py-1.5 rounded-full border border-white/5 backdrop-blur-xs">
            {CUAS_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === activeIdx ? 'bg-red-500 w-4' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative px-8 pb-10 pt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
            <Radar className="w-3.5 h-3.5" /> C-UAS / Threat Awareness Network
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
            Need wide-area drone threat protection?<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
              Deploy your own C-UAS sensor network.
            </span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
            Design and procure a bespoke Counter-UAS perimeter — multi-sensor acoustic, RF, radar, and EO/IR layers with optional AI-directed interception, powered by the SKHY Threat Awareness Manager.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 flex flex-col items-center gap-1">
                <span className="text-red-400">{s.icon}</span>
                <span className="text-xl font-extrabold text-white">{s.value}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{s.label}</span>
              </div>
            ))}
          </div>

          <button
            id="cuas-quote-open-btn"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-700 to-orange-600 hover:shadow-[0_15px_40px_rgba(239,68,68,0.35)] text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 uppercase tracking-wider text-sm border border-red-500/20"
          >
            <Shield className="w-5 h-5" />
            Design C-UAS Network
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 pt-10 pb-20"
        >
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 right-0 z-10 w-9 h-9 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition flex items-center justify-center text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
            <CUASQuoteForm onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

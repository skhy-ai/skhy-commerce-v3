import React from 'react';
import {
  Shield,
  Radar,
  Radio,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Target,
  Zap,
  Globe,
  Building2,
  Lock,
  Compass,
  FileCheck2,
  Handshake,
  CheckCircle2,
  Boxes,
  Activity,
  Crosshair,
  Sparkles,
  Plane,
  FileText,
  BookOpen
} from 'lucide-react';

interface PartnerTwoPagerDocumentProps {
  activePage?: 'all' | 1 | 2;
  baseUrl?: string;
}

export const PartnerTwoPagerDocument: React.FC<PartnerTwoPagerDocumentProps> = ({
  activePage = 'all',
  baseUrl = window.location.origin
}) => {
  const showPage1 = activePage === 'all' || activePage === 1;
  const showPage2 = activePage === 'all' || activePage === 2;

  return (
    <div className="partner-print-root flex flex-col gap-10 items-center w-full">
      {/* ════════════════════════════════════════════════════════════════════
          PAGE 1: CORE OFFERINGS — DEFENSE & INDUSTRIAL PLATFORMS
      ════════════════════════════════════════════════════════════════════ */}
      {showPage1 && (
        <section
          id="partner-doc-page-1"
          className="partner-doc-sheet rounded-xl p-8 sm:p-12 flex flex-col justify-between bg-white text-slate-900 border border-slate-200 shadow-xl overflow-hidden relative select-text"
        >
          {/* Subtle aerospace grid and clean accent lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500" />

          {/* Top Document Header */}
          <div className="relative z-10 border-b border-slate-200 pb-5 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/skhy-logo.jpg"
                  alt="SKHY AI"
                  className="h-12 w-auto rounded border border-slate-300 object-contain shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-slate-950">
                      SKHY<span className="text-sky-600"> SYSTEMS</span>
                    </span>
                    <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-800 font-semibold font-mono">
                      Partner Capability Briefing
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-mono font-semibold mt-0.5">
                    Sovereign Defense & Industrial Sensing Platform
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-600 leading-tight">
                <div className="text-sky-700 font-bold uppercase">Public Partner Briefing // 2026.4</div>
                <div className="text-slate-500">Ref: SKHY-PTR-DOSSIER-V4</div>
                <div className="text-slate-700 font-medium">Alliance Architecture</div>
              </div>
            </div>
          </div>

          {/* Main Page 1 Content */}
          <div className="relative z-10 space-y-5 flex-1">
            {/* Executive Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
              <div className="text-xs font-mono uppercase tracking-wider text-sky-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-sky-600" /> Executive Platform Architecture
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                SKHY AI engineers vertically integrated, multi-domain sensor architectures unified by air-gapped sovereign AI intelligence.
                From non-line-of-sight acoustic MEMS sentinels and deployable sensor masts to standard fiber-optic cables acting as tens of thousands of continuous virtual sensors,
                we deliver real-time perimeter protection, threat neutralization, and critical infrastructure resilience worldwide.
              </p>
            </div>

            {/* TWO CORE OFFERING PILLARS WITH REAL PICTURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* PILLAR 1: DEFENSE PLATFORM */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:border-sky-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5 font-mono">
                      <Shield className="w-4 h-4 text-sky-600" /> Defense Platform
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                      Multi-Domain C2
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Sovereign Sensor Grid & Tactical Interception
                  </h3>

                  {/* Defense Platform Picture */}
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img
                      src="/images/catalog/mobisense/mobisense deployed on military truck.png"
                      alt="SKHY Multi-Spectral Defense Sensor Mast"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        // Fallback to acoustic sensor image if unavailable
                        (e.target as HTMLImageElement).src = '/images/catalog/acoustic-sensors/18cm-16-MEMS-sensor.png';
                      }}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/75 backdrop-blur-xs text-[11px] text-white px-2.5 py-1 font-mono flex items-center justify-between">
                      <span>Tactical Mobile Sensor Mast & Interceptor Node</span>
                      <span className="text-sky-300 font-bold">MIL-STD-810H</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700 mb-3">
                    <li className="flex items-start gap-2">
                      <Radar className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-semibold">Vidur C2 & Threat Manager:</strong> Real-time multi-sensor fusion, automated acoustic track correlation, and air-gapped tactical command.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Cpu className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-semibold">SentryOS Tactical Edge AI:</strong> Sub-millisecond neural inference directly on airframes and field sensor nodes with zero cloud latency.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Crosshair className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-semibold">Autonomous Kinetic Interception:</strong> Directed Counter-UAS effectors, smart RF jamming, and automated target elimination.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1 text-sky-700 font-medium">
                    <Lock className="w-3.5 h-3.5" /> Air-Gapped Sovereign AI
                  </span>
                  <span>NATO SAPIENT Compliant</span>
                </div>
              </div>

              {/* PILLAR 2: INDUSTRIAL PLATFORM */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:border-cyan-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5 font-mono">
                      <Activity className="w-4 h-4 text-cyan-600" /> Industrial Intelligence
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium">
                      DAS / DTS Fiber AI
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Distributed Fiber-Optic Asset Intelligence
                  </h3>

                  {/* Industrial Platform Picture */}
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img
                      src="/images/industries/pipeline_fiber.png"
                      alt="SKHY Distributed Fiber-Optic Acoustic Sensing for Pipelines"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/75 backdrop-blur-xs text-[11px] text-white px-2.5 py-1 font-mono flex items-center justify-between">
                      <span>Morrigan AI GIS Continuous Fiber Acoustic Sensing</span>
                      <span className="text-cyan-300 font-bold">100+ km Reach</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700 mb-3">
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-semibold">Distributed Acoustic Sensing (DAS):</strong> Transforms standard fiber cables into 10,000+ continuous virtual sensors with meter-level positioning.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-semibold">Morrigan AI GIS Integration:</strong> Geospatial prediction of pipeline leaks, ground subsidence, digging, and physical tampering.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-semibold">Zero Remote Field Electronics:</strong> Completely passive optical fiber routes. Zero batteries, zero solar panels, zero field maintenance.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-600">
                  <div className="bg-slate-50 p-1 rounded border border-slate-200">
                    <span className="text-cyan-700 font-bold block text-xs sm:text-sm">$1.5M / min</span>
                    Loss Prevented
                  </div>
                  <div className="bg-slate-50 p-1 rounded border border-slate-200">
                    <span className="text-cyan-700 font-bold block text-xs sm:text-sm">&lt; 1 Meter</span>
                    Spatial Precision
                  </div>
                  <div className="bg-slate-50 p-1 rounded border border-slate-200">
                    <span className="text-cyan-700 font-bold block text-xs sm:text-sm">100+ km</span>
                    Per Unit Reach
                  </div>
                </div>
              </div>
            </div>

            {/* UNIFIED SENSING & AUTONOMY PIPELINE FLOW */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between font-bold">
                <span>Integrated System Topology</span>
                <span className="text-sky-700 font-semibold">Zero Trust Sovereign Architecture</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-sky-700 mb-0.5">1. SENSORS</div>
                  <div className="text-[11px] text-slate-600 leading-tight">Acoustic MEMS • Fiber DAS/DTS • RF • EO/IR</div>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-cyan-700 mb-0.5">2. EDGE INTEL</div>
                  <div className="text-[11px] text-slate-600 leading-tight">SentryOS Tactical Runtime • Fiber Interrogators</div>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-blue-700 mb-0.5">3. C2 & GIS</div>
                  <div className="text-[11px] text-slate-600 leading-tight">Vidur Threat Manager • Morrigan AI Hub</div>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-emerald-700 mb-0.5">4. ACTION</div>
                  <div className="text-[11px] text-slate-600 leading-tight">Kinetic Interceptors • EW • Rapid Dispatch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 1 Document Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600 mt-4">
            <div>
              <span className="font-semibold text-slate-700">Official Links: </span>
              <a
                href={`${baseUrl}/`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 hover:text-sky-900 font-bold underline"
              >
                skhy.systems
              </a>
              <span className="mx-2">•</span>
              <a
                href={`${baseUrl}/defense`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 hover:text-sky-900 font-semibold underline"
              >
                Defense Platform (skhy.systems/defense)
              </a>
              <span className="mx-2">•</span>
              <a
                href={`${baseUrl}/industries`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-700 hover:text-cyan-900 font-semibold underline"
              >
                Industries Platform (skhy.systems/industries)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-bold">
                Page 1 of 2
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PAGE 2: HOW PARTNERS CAN PARTICIPATE, MARKETPLACE & SIMULATOR
      ════════════════════════════════════════════════════════════════════ */}
      {showPage2 && (
        <section
          id="partner-doc-page-2"
          className="partner-doc-sheet rounded-xl p-8 sm:p-12 flex flex-col justify-between bg-white text-slate-900 border border-slate-200 shadow-xl overflow-hidden relative select-text"
        >
          {/* Subtle grid and accent header */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600" />

          {/* Top Document Header */}
          <div className="relative z-10 border-b border-slate-200 pb-5 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/skhy-logo.jpg"
                  alt="SKHY AI"
                  className="h-12 w-auto rounded border border-slate-300 object-contain shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-slate-950">
                      SKHY<span className="text-sky-600"> SYSTEMS</span>
                    </span>
                    <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold font-mono">
                      Partner Ecosystem Blueprint
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-mono font-semibold mt-0.5">
                    Engagement Models, Integration Tools & Commercialization
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-600 leading-tight">
                <div className="text-emerald-700 font-bold uppercase">Commercial Alliance Blueprint</div>
                <div className="text-slate-500">Integration: Hardware • Software • Systems</div>
                <div className="text-slate-700 font-medium">Global Network Access</div>
              </div>
            </div>
          </div>

          {/* Main Page 2 Content */}
          <div className="relative z-10 space-y-4 flex-1">
            {/* FOUR STRATEGIC PARTNER TRACKS */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between font-bold">
                <span className="text-slate-900 flex items-center gap-1.5 font-bold">
                  <Handshake className="w-4 h-4 text-sky-600" /> Four Strategic Partner Tracks
                </span>
                <span className="text-sky-700 font-semibold">Join 60+ Active Hardware & Software Partners</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Track 1: Hardware OEMs */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-sky-400 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 mb-2 font-bold">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">1. Hardware OEMs & Sensors</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    List cameras, acoustic arrays, RF nodes, payloads, and airframe parts in the verified catalog.
                  </p>
                  <span className="text-[11px] font-mono text-sky-700 font-semibold block border-t border-slate-200 pt-1.5">
                    BOM Mapping • Global RFQ
                  </span>
                </div>

                {/* Track 2: Software & AI Developers */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-cyan-400 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-700 mb-2 font-bold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">2. AI & Software Devs</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Deploy neural threat detection, computer vision, and acoustic classification on SentryOS.
                  </p>
                  <span className="text-[11px] font-mono text-cyan-700 font-semibold block border-t border-slate-200 pt-1.5">
                    SentryOS App Store • Royalties
                  </span>
                </div>

                {/* Track 3: System Integrators */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 mb-2 font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">3. System Integrators</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Co-deliver turnkey border, pipeline, and defense installations with dedicated engineering support.
                  </p>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold block border-t border-slate-200 pt-1.5">
                    Turnkey Bidding • Air-Gapped C2
                  </span>
                </div>

                {/* Track 4: Distributors & VARs */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-emerald-400 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-2 font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">4. Value-Added Resellers</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Commercial distribution rights across North America, Europe, Middle East, and Asia-Pacific.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold block border-t border-slate-200 pt-1.5">
                    Protected Margins • Escrow Pay
                  </span>
                </div>
              </div>
            </div>

            {/* TWO HIGHLIGHTED ECOSYSTEM TOOLS WITH REAL PICTURES & ACTIVE HYPERLINKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TOOL 1: SKHY AI MARKETPLACE */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden shadow-sm hover:border-sky-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-sky-800 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 flex items-center gap-1 font-bold">
                      <Boxes className="w-3.5 h-3.5 text-sky-600" /> Catalog Distribution
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">Verified Supplier Network</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-950 mb-1.5 flex items-center gap-1.5">
                    SKHY AI Marketplace
                    <ExternalLink className="w-4 h-4 text-sky-600 inline" />
                  </h3>

                  {/* Marketplace Real Picture */}
                  <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src="/images/catalog/rf-edge-fusion/skhy-jamming-resilient-AI-edge-RF-fusion-device.png"
                      alt="SKHY Marketplace Verified Defense Hardware"
                      className="w-full h-28 object-contain p-2 bg-slate-100"
                    />
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    List your sensors, RF components, optics, and airframes. Access global sovereign buyers, automated RFQ workflows, technical datasheet generation, and escrow payment protection.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <a
                    href={`${baseUrl}/marketplace`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 underline"
                  >
                    <span>Browse Marketplace Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <span className="text-xs font-mono text-slate-500">skhy.systems/marketplace</span>
                </div>
              </div>

              {/* TOOL 2: Build Your Own Autonomy SIMULATOR (MISSION ARCHITECT) */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden shadow-sm hover:border-cyan-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-800 px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 flex items-center gap-1 font-bold">
                      <Plane className="w-3.5 h-3.5 text-cyan-600" /> Digital Twin Simulator
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">Hardware-in-the-Loop</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-950 mb-1.5 flex items-center gap-1.5">
                    Build Your Own Autonomy Simulator
                    <ExternalLink className="w-4 h-4 text-cyan-600 inline" />
                  </h3>

                  {/* Simulator Real Picture */}
                  <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src="/images/products/mission-architect/mission_architect_map.png"
                      alt="Mission Architect Drone Planning Simulation"
                      className="w-full h-28 object-cover"
                    />
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    Integrate your components into <strong>Mission Architect</strong>. When defense teams design drones or test RF coverage, your components are dynamically simulated and converted into direct BOM orders.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <a
                    href={`${baseUrl}/plan-scenario`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900 underline"
                  >
                    <span>Launch Drone Simulator</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <span className="text-xs font-mono text-slate-500">skhy.systems/plan-scenario</span>
                </div>
              </div>
            </div>

            {/* CONSOLIDATED TECHNICAL DOCUMENTATION & WHITEPAPERS FOR PARTNERS */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <BookOpen className="w-4 h-4 text-sky-600" /> Consolidated Partner Technical Documents & Whitepapers
                </span>
                <span className="text-sky-700 font-medium">Export Ready • SAPIENT & STANAG Standard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`${baseUrl}/whitepaper/tam-readme`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-900 hover:text-sky-700 underline block"
                    >
                      Threat Awareness Manager C2 Architecture (SAPIENT / STANAG)
                    </a>
                    <span className="text-[11px] text-slate-500">
                      Interface control document (ICD), MQTT 5.0 / REST APIs, Autonomous Engagement Zones.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`${baseUrl}/whitepaper/gas-pipeline`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-900 hover:text-cyan-700 underline block"
                    >
                      Distributed Fiber Acoustic AI & Morrigan GIS Whitepaper
                    </a>
                    <span className="text-[11px] text-slate-500">
                      Technical whitepaper on acoustic backscatter, meter-level pinpointing, and pipeline integrity.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`${baseUrl}/whitepaper/resilicom-communication`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-900 hover:text-blue-700 underline block"
                    >
                      Resilicom Adaptive MANET Mesh Infrastructure
                    </a>
                    <span className="text-[11px] text-slate-500">
                      MIMO tactical mesh communication and anti-jam RF routing specification.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`${baseUrl}/whitepaper/mission-architect`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-900 hover:text-emerald-700 underline block"
                    >
                      Mission Architect: Strategic Simulation & HITL Guide
                    </a>
                    <span className="text-[11px] text-slate-500">
                      Technical guide for hardware integration, RF propagation models, and automated BOM output.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECT ACTION & PARTNER ONBOARDING BANNER */}
            <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-cyan-50 border border-sky-300 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" /> Ready to Partner with SKHY AI?
                </div>
                <p className="text-xs text-slate-600">
                  Register in under 3 minutes for immediate access to the partner dashboard and marketplace catalog submission.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`${baseUrl}/register`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  Apply as Partner
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`${baseUrl}/login?type=partner`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Partner Sign-in
                </a>
                <a
                  href={`${baseUrl}/nda`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Mutual NDA
                </a>
              </div>
            </div>
          </div>

          {/* Page 2 Document Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600 mt-4">
            <div>
              <span className="font-semibold text-slate-700">Official Inquiries: </span>
              <a href="mailto:partners@skhy.systems" className="text-sky-700 hover:underline font-bold">
                partners@skhy.systems
              </a>
              <span className="mx-2">•</span>
              <span>Offices: Singapore (HQ), UAE, Denmark, India, Switzerland</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-bold">
                Page 2 of 2
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

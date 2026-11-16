import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PartnerTwoPagerDocument } from '../components/partner/PartnerTwoPagerDocument';
import '../styles/partnerPrint.css';
import {
  Printer,
  Download,
  Eye,
  ArrowRight,
  Handshake,
  Shield,
  Layers,
  ShoppingBag,
  Plane,
  FileCheck2,
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  BookOpen,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { trackEvent } from '../services/analyticsService';
import { whitepapers } from '../data';
import { THREAT_MANAGER_DOCS } from '../data/threatManagerDocs';

export const PartnerLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activePageView, setActivePageView] = useState<'all' | 1 | 2>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [docFilter, setDocFilter] = useState<'all' | 'specs' | 'whitepapers'>('all');

  const handlePrintPdf = () => {
    setIsGeneratingPdf(true);
    trackEvent({
      eventType: 'cta_click',
      sectionName: 'partner_two_pager_download_pdf',
      metadata: { page: 'partner_landing' }
    });

    // Ensure both pages are active for print output
    setActivePageView('all');

    setTimeout(() => {
      window.print();
      setIsGeneratingPdf(false);
    }, 250);
  };

  // Curated Partner Technical Specifications
  const partnerSpecs = [
    {
      id: 'tam-readme',
      title: 'Threat Awareness Manager — System Architecture & README',
      category: 'System Architecture',
      badge: 'NATO & SAPIENT Core',
      description: 'Comprehensive architectural specification covering NATO STANAG 4869 and UK MoD SAPIENT compliance, Autonomous Engagement Zones (AEZ), and 8-cardinal threat vector alignment.',
      link: '/whitepaper/tam-readme',
      type: 'spec'
    },
    {
      id: 'tam-api-integration',
      title: 'Threat Awareness Manager — API Integration & SAPIENT Protocol Specification',
      category: 'Integration Protocols',
      badge: 'MQTT 5.0 / REST API',
      description: 'Technical interface control document (ICD) detailing UK DSTL SAPIENT ASM/BAP messaging, MQTT 3.1.1/5.0 topic trees, RESTful control APIs, and MANET mesh telemetry.',
      link: '/whitepaper/tam-api-integration',
      type: 'spec'
    },
    {
      id: 'das-dts-spec',
      title: 'Distributed Fiber-Optic Acoustic (DAS) & Temperature (DTS) Architecture',
      category: 'Industrial Sensing',
      badge: 'Fiber Intelligence',
      description: 'Technical architecture on transforming single-mode optical fiber into 10,000+ virtual acoustic and temperature sensors integrated with Morrigan AI GIS.',
      link: '/whitepaper/gas-pipeline',
      type: 'spec'
    },
    {
      id: 'mission-architect-spec',
      title: 'Mission Architect: Digital Twin & Hardware-in-the-Loop Integration',
      category: 'Simulation & BOM',
      badge: 'Simulator Engine',
      description: 'Developer guide for mapping OEM sensors, payloads, and motors into real-time RF propagation and endurance simulations linked to automated Marketplace BOM orders.',
      link: '/whitepaper/mission-architect',
      type: 'spec'
    }
  ];

  // Curated Partner Whitepapers
  const partnerWhitepapers = [
    {
      id: 'threat-awareness',
      title: 'Threat Awareness Management using Sensor Fusion',
      category: 'Defense Whitepaper',
      badge: 'Sensor Fusion',
      description: 'Research on multi-sensor acoustic, RF, and electro-optical fusion for real-time situational awareness and counter-UAS interception in complex EW environments.',
      link: '/whitepaper/threat-awareness',
      type: 'whitepaper'
    },
    {
      id: 'gas-pipeline',
      title: 'Gas Pipeline & Linear Infrastructure Monitoring with Acoustic AI and GIS',
      category: 'Industrial Whitepaper',
      badge: 'Pipeline Asset AI',
      description: 'Technical whitepaper detailing acoustic backscatter physics, real-time leak prediction, digging detection, and GIS threat mapping.',
      link: '/whitepaper/gas-pipeline',
      type: 'whitepaper'
    },
    {
      id: 'resilicom-communication',
      title: 'Resilicom Communication: Resilient MANET Mesh Infrastructure',
      category: 'Communications',
      badge: 'Tactical Mesh',
      description: 'Robust communications framework providing uninterrupted connectivity for autonomous drone swarms and remote tactical nodes under active RF jamming.',
      link: '/whitepaper/resilicom-communication',
      type: 'whitepaper'
    },
    {
      id: 'interceptor-male-guidance',
      title: 'Interceptor & MALE Drone Guidance Network Specification',
      category: 'Counter-UAS',
      badge: 'Kinetic Interception',
      description: 'Operational analysis of coordinated kinetic interceptor guidance with long-range surveillance drones to defeat maneuvering and jamming-resistant loitering munitions.',
      link: '/whitepaper/interceptor-male-guidance',
      type: 'whitepaper'
    }
  ];

  const displayedDocs =
    docFilter === 'all'
      ? [...partnerSpecs, ...partnerWhitepapers]
      : docFilter === 'specs'
      ? partnerSpecs
      : partnerWhitepapers;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      {/* ─── Web Navigation (Hidden when printing) ─── */}
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* ─── Hero Header & Action Toolbar (Hidden when printing) ─── */}
      <div className="print:hidden pt-28 pb-8 px-4 sm:px-6 lg:px-8 border-b border-sky-500/10 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Top Pill & Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-medium mb-3">
                <Handshake className="w-4 h-4" />
                <span>Global Technology & Defense Alliance</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Partner Capability <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">Two-Pager</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-2 font-light">
                Review our vertically integrated Defense and Industrial sensing architectures, explore partner engagement models, or generate an executive PDF briefing with active links.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrintPdf}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Preparing PDF...' : 'Download Two-Pager PDF'}</span>
              </button>

              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Apply as Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login?type=partner"
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-semibold transition-all"
              >
                Partner Login
              </Link>
            </div>
          </div>

          {/* Interactive Document View Switcher Bar */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 mr-2 flex items-center gap-1.5 font-semibold">
                <Eye className="w-4 h-4 text-sky-400" /> View Mode:
              </span>
              <button
                onClick={() => setActivePageView('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activePageView === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Two-Page Spread
              </button>
              <button
                onClick={() => setActivePageView(1)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activePageView === 1
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Page 1: Defense & Industries
              </button>
              <button
                onClick={() => setActivePageView(2)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activePageView === 2
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Page 2: Partner Opportunities
              </button>
            </div>

            {/* Quick Ecosystem Links */}
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <Link
                to="/marketplace"
                className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-sky-300 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span>Marketplace</span>
              </Link>
              <Link
                to="/plan-scenario"
                className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <Plane className="w-4 h-4 text-cyan-400" />
                <span>Drone Simulator</span>
              </Link>
              <a
                href="#partner-docs"
                className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-blue-300 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Docs & Whitepapers</span>
              </a>
              <Link
                to="/nda"
                className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Mutual NDA</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Two-Pager Document Presentation Stage (White background & Black text) ─── */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <PartnerTwoPagerDocument activePage={activePageView} />
        </div>
      </main>

      {/* ─── CONSOLIDATED PARTNER TECHNICAL DOCUMENTATION & WHITEPAPERS ─── */}
      <section id="partner-docs" className="print:hidden border-t border-slate-800/80 bg-slate-900/60 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2 block flex items-center gap-1.5 font-bold">
                <BookOpen className="w-4 h-4 text-sky-400" /> Consolidated Partner Technical Library
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Technical Specifications & Research Whitepapers
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl font-light">
                Access verified system interface control documents (ICD), integration protocols (SAPIENT / NATO STANAG), and foundational research whitepapers compiled for our technology partners.
              </p>
            </div>

            {/* Document Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setDocFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  docFilter === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Documents ({partnerSpecs.length + partnerWhitepapers.length})
              </button>
              <button
                onClick={() => setDocFilter('specs')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  docFilter === 'specs'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                System Specs ({partnerSpecs.length})
              </button>
              <button
                onClick={() => setDocFilter('whitepapers')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  docFilter === 'whitepapers'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Whitepapers ({partnerWhitepapers.length})
              </button>
            </div>
          </div>

          {/* Consolidated Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-950 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-sky-500/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                        doc.type === 'spec'
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {doc.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors mb-2 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                  <Link
                    to={doc.link}
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-200 font-semibold group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Read Full Documentation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-[11px] font-mono text-slate-500">
                    PDF / Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Partner Value Proposition Cards (Hidden when printing) ─── */}
      <section className="print:hidden border-t border-slate-800/80 bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2 block font-bold">
              Co-Innovation Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Why Partner with SKHY AI?
            </h2>
            <p className="text-slate-400 text-sm">
              We empower sensor creators, software innovators, and defense systems integrators to deploy globally with sovereign air-gapped readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-sky-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Sovereign Defense Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your payloads, hardware, or AI models directly into government and defense procurement tenders across North America, Europe, UAE, and APAC.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Digital Twin & Simulator BOM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your components are actively simulated in Mission Architect. Defense planners test RF, payload, and power limits, directly generating BOM purchases of your parts.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Automated Escrow & IP Shield</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless multi-currency transactions, bilateral mutual NDAs, and sovereign air-gapped runtimes protecting your proprietary edge neural weights.
              </p>
            </div>
          </div>

          {/* Bottom Onboarding CTA Bar */}
          <div className="mt-12 bg-gradient-to-r from-blue-950/60 via-slate-900 to-sky-950/60 border border-sky-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Begin Your Partnership Today</h3>
              <p className="text-sm text-slate-400">
                Register in less than 3 minutes to access the partner dashboard, technical documentation, and marketplace catalog submission.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrintPdf}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
              >
                <span>Apply as Partner</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer (Hidden when printing) ─── */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default PartnerLanding;

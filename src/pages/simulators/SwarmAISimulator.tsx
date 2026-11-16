import React, { useState } from 'react';
import { SwarmSideBanner } from '../../components/simulators/SwarmAI/SwarmSideBanner';
import { MotherRelayStatus } from '../../components/simulators/SwarmAI/MotherRelayStatus';
import { TacticalRadar } from '../../components/simulators/SwarmAI/TacticalRadar';
import { SwarmMimoMesh } from '../../components/simulators/SwarmAI/SwarmMimoMesh';
import { Layout, Maximize2, Settings2, Bell, User } from 'lucide-react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationModal } from '../../components/VerificationModal';
const SwarmAI: React.FC = () => {
  const [activeView, setActiveView] = useState<'tactical' | 'analysis'>('tactical');
  const { user } = useAuth();
  const [showVerification, setShowVerification] = useState(false);

  return (
    <ThemeProvider>
      <div className="h-screen bg-slate-950 flex overflow-hidden font-sans text-slate-200">
        {/* Side Banner Branding */}
        <SwarmSideBanner />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header / Nav */}
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-6">
              <nav className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => {
                    if (!user?.government_id_verified) {
                      setShowVerification(true);
                    } else {
                      setActiveView('tactical');
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'tactical' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Tactical View
                </button>
                <button 
                  onClick={() => setActiveView('analysis')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'analysis' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Post-Mission Analysis
                </button>
              </nav>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM_LIVE: <span className="text-slate-300">08:42:12</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors"><Bell className="w-4 h-4" /></button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors"><Settings2 className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-slate-800 mx-2" />
              <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all">
                <span className="text-xs font-bold text-slate-300">C2_OFFICER_01</span>
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </button>
            </div>
          </header>

          {/* Grid Layout */}
          <main className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden">
            {/* Left Column: Tactical Radar */}
            <div className="col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">Aerial Surveillance Mesh</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Layout className="w-4 h-4" /></button>
                  <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Maximize2 className="w-4 h-4" /></button>
                </div>
              </div>
              <TacticalRadar />
            </div>

            {/* Right Column: Status & Network */}
            <div className="col-span-4 flex flex-col gap-8 overflow-y-auto pr-2 no-scrollbar">
              <MotherRelayStatus />
              <SwarmMimoMesh />
              
              {/* Swarm Intelligence Logs */}
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Bell className="w-3 h-3" /> Intel Stream
                </h3>
                <div className="space-y-4">
                  {[
                    { time: '12:45:01', msg: 'Swarm separation confirmed. Sector B-12.', type: 'info' },
                    { time: '12:45:12', msg: 'Mother Relay signal optimized via Beamforming.', type: 'success' },
                    { time: '12:46:05', msg: 'Jamming detected in 2.4GHz band. Switching to MIMO Mesh 4.', type: 'warning' },
                    { time: '12:46:32', msg: 'Aerial target T1 tracked via collaborative radar triangulation.', type: 'alert' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-3 text-[10px] leading-tight">
                      <span className="font-mono text-slate-600 shrink-0">{log.time}</span>
                      <p className={`font-medium ${
                        log.type === 'warning' ? 'text-amber-400' : 
                        log.type === 'alert' ? 'text-red-400' : 
                        log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {log.msg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>

        <VerificationModal 
          isOpen={showVerification} 
          onClose={() => setShowVerification(false)} 
          onSuccess={() => {
            setShowVerification(false);
            setActiveView('tactical');
          }} 
        />
      </div>
    </ThemeProvider>
  );
};

export default SwarmAI;

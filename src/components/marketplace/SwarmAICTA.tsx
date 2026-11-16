import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Share2, Shield, ArrowRight } from 'lucide-react';

export const SwarmAICTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-12 group">
      {/* Background Image / Decoration */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <img 
          src="/images/swarm-ai/side-banner.png" 
          alt="Swarm AI Banner" 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            New Module: Swarm AI
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Deploy Collaborative <br />
            <span className="text-indigo-400 italic">Swarm Intelligence</span>
          </h2>
          
          <p className="text-slate-400 text-lg leading-relaxed">
            Revolutionize your operations with a collaborative swarm of UAS functioning as an integrated airborne radar network. 
            Leverage SKHY's anti-jamming resilient hardware and Mimo Mesh technology for beyond line-of-sight command & control.
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Share2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="block text-white font-bold text-sm">Mimo Mesh</span>
                <span className="text-xs text-slate-500">Resilient Comms</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="block text-white font-bold text-sm">Anti-Jamming</span>
                <span className="text-xs text-slate-500">Electronic Warfare Proof</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={() => navigate('/simulators/swarm-ai')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 group/btn"
            >
              Explore Swarm Simulator
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right side graphic or just spacer for the background image */}
        <div className="hidden md:block w-1/3 aspect-square relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
            {/* Swarm Visualization placeholder or icon */}
            <div className="relative w-full h-full flex items-center justify-center">
                 <div className="grid grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-12 h-12 bg-slate-800 border border-indigo-500/30 rounded-xl flex items-center justify-center animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]" />
                        </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, Gauge, Weight, Briefcase, Shield, ChevronRight, X, Sparkles, MessageSquare, ShieldCheck, Zap, ShieldAlert, Mountain, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { identifyDronePreset, RangeCategory, UserType } from '../../utils/presetIdentification';
import { MissionAIPrompt } from '../simulators/MissionArchitect/MissionAIPrompt';
import { MissionStateProvider } from '../../contexts/MissionStateContext';
import { generateMissionConfig } from '../../services/aiMissionService';

interface MissionArchitectCTAProps {
  onLaunch?: () => void;
}

export const MissionArchitectCTA: React.FC<MissionArchitectCTAProps> = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      image: '/images/products/mission-architect/mission_architect_map.png',
      title: 'Global Mission Planning',
      desc: 'Simulate operations in high-fidelity 3D environments.'
    },
    {
      image: '/images/products/mission-architect/mission_architect_architecture.png',
      title: 'Automated Hardware Mapping',
      desc: 'Real-time BOM generation linked to the Marketplace.'
    },
    {
      image: '/images/products/mission-architect/mission_architect_transmission.png',
      title: 'RF Propagation Analysis',
      desc: 'Predict communication links based on chosen hardware.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 rounded-3xl border border-white/10 mb-12 group shadow-[0_0_50px_-12px_rgba(14,165,233,0.3)]">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(14,165,233,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch">
          {/* Text Content */}
          <div className="flex-1 px-8 py-12 md:px-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Industry First
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Build Your Own Autonomy: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                The First Marketplace-Integrated Builder
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
              Stop guessing. Start building. The industry's first mission-driven hardware architecture engine.
              <span className="text-white font-medium block mt-2">Design your mission. Simulate it. Auto-populate your cart with verified hardware.</span>
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowModal(true)}
                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg hover:shadow-[0_20px_50px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
              >
                Start Your Build
                <ArrowRight className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Verified Compatibility
              </div>
            </div>
          </div>

          {/* Feature Carousel */}
          <div className="lg:w-1/2 min-h-[400px] relative bg-slate-900/40 border-l border-white/10 overflow-hidden hidden md:block">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform flex items-center justify-center p-8 ${idx === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-110 translate-x-8'
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/10 to-transparent pointer-events-none" />

                <div className="absolute bottom-12 left-12 right-12 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-0.5 w-8 bg-sky-500" />
                    <span className="text-sky-400 font-mono text-[10px] uppercase tracking-widest">Platform Feature</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{slide.title}</h3>
                  <p className="text-slate-400 text-sm max-w-sm drop-shadow-md">{slide.desc}</p>
                </div>
              </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-sky-500' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-white/10 rounded-2xl max-w-xl w-full p-8 relative shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <MissionStateProvider>
              <WizardFlow closeModal={() => setShowModal(false)} navigate={navigate} />
            </MissionStateProvider>
          </div>
        </div>
      )}
    </>
  );
};

// Wizard Flow Component (Extracted from Hero.tsx)
const WizardFlow: React.FC<{ closeModal: () => void, navigate: any }> = ({ closeModal, navigate }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showAI, setShowAI] = useState(false);
  const [userType, setUserType] = useState<UserType>('commercial');
  const [range, setRange] = useState<RangeCategory>('mid');
  const [payload, setPayload] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);

  const fallbackRecommendation = identifyDronePreset(userType, range, payload);
  const currentRecommendation = aiRecommendation || fallbackRecommendation;

  const handleCalculate = async () => {
    setStep(4);
    setCalculating(true);
    try {
      const prompt = `I need a drone for a ${userType} mission. The required operational radius is ${range === 'short' ? '< 5km' : range === 'mid' ? '5-20km' : '> 20km'}. The expected payload mass is ${payload} kg.`;
      const response = await generateMissionConfig(prompt);
      if (response.topOptions && response.topOptions.length > 0) {
        setAiRecommendation({
          presetId: response.topOptions[0].updates?.templateId || fallbackRecommendation.presetId,
          platform: response.topOptions[0].platform,
          name: response.topOptions[0].name,
          description: `AI Match (${response.topOptions[0].suitabilityScore}%): Recommended configuration for ${payload}kg payload in a ${userType} context.`
        });
      }
    } catch (error) {
      console.error('AI Mission Service Error:', error);
      // fallback already handles it
    } finally {
      setCalculating(false);
    }
  };

  const handleFinish = () => {
    closeModal();
    const params = new URLSearchParams({
      preset: currentRecommendation.presetId,
      platform: currentRecommendation.platform,
      type: userType,
      payload: payload.toString()
    });
    navigate(`/plan-scenario?${params.toString()}`);
  };

  if (showAI) {
    return (
      <div className="flex flex-col h-full animate-fade-in">
        <button
          onClick={() => setShowAI(false)}
          className="text-slate-500 hover:text-white mb-4 text-sm flex items-center gap-1 self-start"
        >
          &larr; Back to Selection
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1 text-white">AI Mission Planner</h2>
          <p className="text-slate-400 text-sm">Describe your mission in plain text</p>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          <MissionAIPrompt
            onComplete={(newPlatform, newEnv, presetId) => {
              const params = new URLSearchParams({
                platform: newPlatform,
                type: newEnv
              });
              if (presetId) params.append('preset', presetId);
              closeModal();
              navigate(`/plan-scenario?${params.toString()}`);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in text-white">
      {/* Progress bar */}
      <div className="flex gap-2 mb-8 shrink-0">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-sky-500' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col overflow-y-auto pr-1">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Mission Environment Setup</h2>
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest leading-relaxed">Identify operational constraints to optimize platform recommendations</p>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Commercial / Low Risk */}
            <button
              onClick={() => {
                setUserType('commercial');
                setStep(2);
              }}
              className={`group relative p-6 rounded-2xl border-2 transition-all text-left border-slate-800 bg-white/5 hover:border-sky-500/50 hover:bg-sky-500/5`}
            >
              <div className="bg-emerald-500/20 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Commercial Operations</h3>
              <p className="text-xs text-slate-400 mb-4">Standard environments with no intentional RF interference or extreme terrain obstacles.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">Standard GNSS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">Direct Link</span>
              </div>
            </button>

            {/* Tactical / High Risk */}
            <button
              onClick={() => {
                setUserType('tactical');
                setStep(5);
              }}
              className={`group relative p-6 rounded-2xl border-2 transition-all text-left border-slate-800 bg-white/5 hover:border-red-500/50 hover:bg-red-500/5`}
            >
              <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">RF Challenged / Tactical</h3>
              <p className="text-xs text-slate-400 mb-4">Strategic operations involving RF jamming, GPS denial, or mountainous terrain obstacles.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">Anti-Jam</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">Beyond Line of Sight</span>
              </div>
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button
              onClick={() => setShowAI(true)}
              className="w-full p-4 bg-sky-500/5 border border-sky-500/20 rounded-2xl hover:bg-sky-500/10 hover:border-sky-500/50 transition-all flex items-center justify-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <div className="font-bold text-white">Plan with AI</div>
                <div className="text-xs text-slate-500">Describe your scenario in natural language</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-sky-500" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white mb-4 text-sm flex items-center gap-1">&larr; Back</button>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Mission Range</h2>
            <p className="text-slate-400">What is the required radius?</p>
          </div>
          <div className="space-y-3 flex-1 justify-center flex flex-col">
            {[
              { id: 'short', label: 'Short Range', sub: '< 5km Radius', icon: Gauge },
              { id: 'mid', label: 'Medium Range', sub: '5 – 20km Radius', icon: Gauge },
              { id: 'long', label: 'Long Range / Global', sub: '20km+ (Fixed-Wing focus)', icon: Gauge },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => { setRange(r.id as RangeCategory); setStep(3); }}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-sky-500/10 hover:border-sky-500/50 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                  <r.icon className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{r.label}</div>
                  <div className="text-xs text-slate-500">{r.sub}</div>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto text-slate-600 group-hover:text-sky-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col">
          <button onClick={() => setStep(2)} className="text-slate-500 hover:text-white mb-4 text-sm flex items-center gap-1">&larr; Back</button>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Payload Capacity</h2>
            <p className="text-slate-400">Enter expected payload mass</p>
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Weight className="w-6 h-6 text-sky-500" />
              </div>
              <input
                type="number"
                value={payload}
                onChange={(e) => setPayload(Number(e.target.value))}
                placeholder="0.0"
                className="w-full bg-slate-800 border-2 border-white/10 rounded-2xl py-6 pl-14 pr-16 text-3xl font-bold focus:border-sky-500 outline-none transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-slate-500 font-bold">
                KG
              </div>
            </div>
            <button
              onClick={handleCalculate}
              className="w-full py-4 bg-sky-500 rounded-xl font-bold text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
            >
              Calculate Recommendation
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 flex flex-col">
          <button onClick={() => setStep(3)} className="text-slate-500 hover:text-white mb-4 text-sm flex items-center gap-1">&larr; Back</button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Proposed Configuration</h2>
            <p className="text-slate-400 text-sm">Best match for your requirements</p>
          </div>

          {calculating ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
              <div className="text-sky-400 font-bold animate-pulse">Running AI Physics Engine...</div>
            </div>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 mb-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-12 h-12 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{currentRecommendation.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {currentRecommendation.description}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Platform</span>
                    <span className="text-sm text-sky-400 font-bold capitalize">{currentRecommendation.platform.replace('-', ' ')}</span>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Context</span>
                    <span className="text-sm text-sky-400 font-bold capitalize">{userType}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Launch Build Your Own Autonomy
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="flex-1 flex flex-col overflow-y-auto pr-1">
          <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white mb-4 text-sm flex items-center gap-1 self-start">&larr; Back</button>
          <TacticalHazardSetup
            onComplete={(env) => {
              const params = new URLSearchParams({
                platform: 'multirotor',
                type: env
              });
              closeModal();
              navigate(`/plan-scenario?${params.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

const TacticalHazardSetup: React.FC<{ onComplete: (env: any) => void }> = ({ onComplete }) => {
  const [hazards, setHazards] = useState<{ jamming: boolean, mountain: boolean }>({ jamming: false, mountain: false });

  const toggleHazard = (key: 'jamming' | 'mountain') => {
    setHazards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getEnvType = () => {
    if (hazards.jamming && hazards.mountain) return 'both';
    if (hazards.jamming) return 'jamming';
    if (hazards.mountain) return 'mountain';
    return null;
  };

  const envType = getEnvType();

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Tactical Theater Configuration</h2>
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest leading-relaxed">Specify environmental hazards to optimize platform resilience</p>
      </div>

      <div className={`p-6 rounded-2xl border-2 border-slate-800 bg-white/5 mb-6`}>
        <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4">
          <Zap className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Select Active Challenges</h3>
        <p className="text-xs text-slate-400 mb-6">These parameters will determine the necessary anti-jamming and positioning hardware for the mission.</p>

        <div className="space-y-3">
          <button
            onClick={() => toggleHazard('jamming')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${hazards.jamming ? 'border-amber-500 bg-amber-500/20' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">RF Jamming</div>
                <div className="text-[9px] text-slate-500">Requires anti-jamming mesh & fiber-optic fallback</div>
              </div>
            </div>
            {hazards.jamming && <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />}
          </button>

          <button
            onClick={() => toggleHazard('mountain')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${hazards.mountain ? 'border-amber-500 bg-amber-500/20' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
          >
            <div className="flex items-center gap-3">
              <Mountain className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">Mountainous Terrain</div>
                <div className="text-[9px] text-slate-500">Requires Beyond-Line-of-Sight (BLOS) relay hardware</div>
              </div>
            </div>
            {hazards.mountain && <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />}
          </button>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Stack:</span>
            <div className="flex gap-1">
              {hazards.jamming && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold uppercase">Jamming</span>}
              {hazards.mountain && <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold uppercase">Terrain</span>}
              {!hazards.jamming && !hazards.mountain && <span className="text-[9px] text-slate-600 italic">No hazards selected</span>}
            </div>
          </div>
          {envType === 'both' && (
            <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Combined Theater
            </div>
          )}
        </div>

        {envType && (
          <button
            onClick={() => onComplete(envType)}
            className="w-full mt-8 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group"
          >
            Initialize Tactical Build
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useMemo } from 'react';
import HeavyLiftSimulator from './HeavyLiftSimulator';
import RobustTransmissionSimulator from './RobustTransmissionSimulator';
import FixedWingTransmissionSimulator from './FixedWingTransmissionSimulator';
import RoverTransmissionSimulator from './RoverTransmissionSimulator';
import { MissionWiringViewer } from '../../components/simulators/MissionArchitect/MissionWiringViewer';
import { UpgradeModal } from '../../components/simulators/MissionArchitect/UpgradeModal';
import { LoginPromptModal } from '../../components/simulators/MissionArchitect/LoginPromptModal';
import { PositioningPhase, PositioningResult } from '../../components/simulators/Positioning/PositioningPhase';
import FixedWingPositioningPhase from '../../components/simulators/Positioning/FixedWingPositioningPhase';
import RoverPositioningPhase from '../../components/simulators/Positioning/RoverPositioningPhase';
import { Plane, Radio, ShieldAlert, Network, Save, FolderOpen, X, Globe } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSavedMissions } from '../../hooks/useSavedMissions';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import FixedWingSimulator from './FixedWingSimulator';
import RoverSimulator from '../../components/simulators/Rover/RoverSimulator';
import { useHeavyLiftSimulation } from '../../hooks/useHeavyLiftSimulation';
import { useFixedWingSimulation } from '../../hooks/useFixedWingSimulation';
import { AJ_GPS_SYSTEM, ROVER_CORE_SYSTEM } from '../../data/simulators/equipment';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useMissionState } from '../../contexts/MissionStateContext';
import { CheckCircle2 } from 'lucide-react';
import missionFlow from '../../data/simulators/missionFlow.json';
import { ReactFlowProvider } from '@xyflow/react';
import { PRE_GENERATED_CONFIGS } from '../../data/preGeneratedConfigs';

const ICON_MAP: Record<string, any> = {
    Globe,
    Plane,
    Radio,
    ShieldAlert,
    Network
};

const deriveItems = (products: any[], filter: (p: any) => boolean) => {
    return products
        .filter(filter)
        .map(p => ({
            id: p.id,
            name: p.name,
            price: p.base_price > 0 ? p.base_price : (p.id.toString() === '900015' ? AJ_GPS_SYSTEM.price : (p.id.toString() === '900009' ? ROVER_CORE_SYSTEM.price : 0)),
            power_draw_w: p.power_draw_w ?? (p.id.toString() === '900015' ? AJ_GPS_SYSTEM.power_draw_w : (p.id.toString() === '900009' ? ROVER_CORE_SYSTEM.power_draw_w : 0))
        }))
        .filter(i => i.price > 0);
};

function MissionArchitectContent() {
    const { products, loading } = useMarketplace();
    const { addToCart, items, clearCart } = useCart();
    const { completedPhases } = useMissionState();
    const { saveMission, savedMissions, deleteMission } = useSavedMissions();
    const { isCommercialEmail, user } = useAuth();

    const [searchParams] = useSearchParams();
    const platformParam = searchParams.get('platform') as 'multirotor' | 'fixed-wing' | null;
    const envParam = searchParams.get('type') as 'none' | 'jamming' | 'mountain' | 'both' | null;

    const heavyLiftSim = useHeavyLiftSimulation();
    const fixedWingSim = useFixedWingSimulation();

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);


    const [positioningResult, setPositioningResult] = useState<PositioningResult | null>(null);
    const [missionName, setMissionName] = useState('');
    const [isLoadMenuOpen, setIsLoadMenuOpen] = useState(false);

    const handleSave = async () => {
        if (!user) {
            setIsLoginPromptOpen(true);
            return;
        }
        if (!missionName.trim()) return;
        await saveMission(missionName.trim(), items);
        setMissionName('');
    };

    const handleLoad = (loadedItems: any[]) => {
        clearCart();
        loadedItems.forEach((item: any) => addToCart(item.id || item.product_id, item.quantity ?? 1, item));
        setIsLoadMenuOpen(false);
    };

    const [activeStep, setActiveStep] = useState<string>(missionFlow.steps[0].id);
    const [platform, setPlatform] = useState<'multirotor' | 'fixed-wing' | 'rover'>(platformParam === 'fixed-wing' ? 'fixed-wing' : 'multirotor');

    const [envType] = useState<'none' | 'jamming' | 'mountain' | 'both' | null>(envParam || 'none');

    const [selectedAntiGpsId, setSelectedAntiGpsId] = useState<number>(() => 900015);
    const [selectedRoverId, setSelectedRoverId] = useState<number>(() => 900009);



    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'rf-jammer' || tab === 'anti-jam') {
            setActiveStep('positioning');
        }
    }, [searchParams]);

    // Handle initial loading of preset config from query parameter
    useEffect(() => {
        const preset = searchParams.get('preset');
        if (preset) {
            const searchIdHyphen = preset.replace(/_/g, '-');
            const searchIdUnder = preset.replace(/-/g, '_');
            const match = PRE_GENERATED_CONFIGS.find(c => c.id === searchIdHyphen || c.id === searchIdUnder);
            if (match) {
                setPlatform(match.platform);
                const normalizedPreset = match.id.replace(/-/g, '_');
                if (match.platform === 'multirotor') {
                    heavyLiftSim.controls.setTemplateId(normalizedPreset);
                } else if (match.platform === 'fixed-wing') {
                    fixedWingSim.controls.setTemplateId(normalizedPreset);
                }
            }
        }
    }, [searchParams]);

    const isPhaseCompleted = (phaseToCheck: string, platformToCheck: string) => {
        const phases = completedPhases as any;
        return phases[phaseToCheck]?.[platformToCheck] === true;
    };

    const handlePhaseNavigation = (targetStep: string) => {
        const currentIndex = missionFlow.steps.findIndex(s => s.id === activeStep);
        const targetIndex = missionFlow.steps.findIndex(s => s.id === targetStep);

        if (targetIndex === -1) return;

        // Skip logic based on missionFlow configuration
        const targetStepData = missionFlow.steps[targetIndex];
        if (targetStepData?.skipFor?.includes(envType || '')) {
            if (targetIndex > currentIndex) {
                // Find next non-skipped step
                const nextStep = missionFlow.steps.slice(targetIndex + 1).find(s => !s.skipFor?.includes(envType || ''));
                if (nextStep) setActiveStep(nextStep.id);
            } else {
                // Find previous non-skipped step
                const prevStep = missionFlow.steps.slice(0, targetIndex).reverse().find(s => !s.skipFor?.includes(envType || ''));
                if (prevStep) setActiveStep(prevStep.id);
            }
            return;
        }

        // If moving forward, require completion of current phase for current platform
        // removed BOM check

        setActiveStep(targetStep);
    };

    type PlatformType = 'multirotor' | 'fixed-wing' | 'rover';

    const allowedPlatforms = useMemo<PlatformType[]>(() => {
        const rules = missionFlow.platformRules as Record<string, PlatformType[]>;
        return rules[envType || 'none'] || ['multirotor'];
    }, [envType]);

    const handlePlatformChange = (newPlatform: 'multirotor' | 'fixed-wing' | 'rover') => {
        if (!allowedPlatforms.includes(newPlatform)) {
            toast.error(`${newPlatform} is not required for your current environment profile.`);
            return;
        }
        // Require previous phases to be completed for the *new* platform before switching pills in advanced phases
        // removed platform change phase completion checks
        setPlatform(newPlatform);
    };

    const crpaItems = deriveItems(products, p => p.name.includes('AJGPS') || p.description?.includes('Anti-Jam'));
    const roverItemsList = deriveItems(products, p => p.category?.toLowerCase() === 'edge-ai' || p.name.includes('Rover') || p.name.includes('SKHY'));

    useEffect(() => {
        if (!loading && !selectedAntiGpsId && crpaItems.length > 0) setSelectedAntiGpsId(crpaItems[0].id);
        if (!loading && !selectedRoverId && roverItemsList.length > 0) setSelectedRoverId(roverItemsList[0].id);
    }, [loading, crpaItems, roverItemsList]);

    const activeDroneCalcData = platform === 'multirotor' ? heavyLiftSim.derived.calcData : (platform === 'fixed-wing' ? fixedWingSim.derived.calcData : null);

    // Rover has its own power model — synthesize PayloadRangeLogic-compatible shape
    const roverCalcData = platform === 'rover' ? {
        totalPayload: ROVER_CORE_SYSTEM.weight_kg,
        payloadReserve: 5.0 - ROVER_CORE_SYSTEM.weight_kg, // 5kg max UGV payload budget
        totalAUW: 8.5,  // typical UGV chassis + core
        rangeKm: (100 / ((ROVER_CORE_SYSTEM.power_draw_w || 25) + 10)) * 12, // simplified range estimate
        flightTimeHrs: (100 / (ROVER_CORE_SYSTEM.power_draw_w || 25)) / 60, // hrs on 100Wh battery
        totalMaxThrust: 0,
        hoverThrottle: 0
    } : null;

    const activeCalcData = platform === 'rover' ? roverCalcData : activeDroneCalcData;


    interface MissionStep {
        id: string;
        label: string;
        icon: string;
        description: string;
        skipFor?: string[];
    }

    const steps = (missionFlow.steps as MissionStep[])
        .filter(step => !step.skipFor || !step.skipFor.includes(envType || ''))
        .map(step => ({
            ...step,
            icon: ICON_MAP[step.icon] || Globe
        }));

    if (loading) {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initialising Build Your Own Autonomy...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
                {/* Wizard Navigation header */}
                <div className="bg-slate-900 border-b border-slate-800 shrink-0 select-none z-30">
                    <div className="container mx-auto px-4 flex items-center justify-between min-h-[52px]">
                        {/* Phase Tabs */}
                        <div className="flex overflow-x-auto no-scrollbar">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = activeStep === step.id;
                                const isPast = steps.findIndex(s => s.id === activeStep) > idx;

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => handlePhaseNavigation(step.id as any)}
                                        className={`flex items-center px-4 py-4 font-semibold text-xs tracking-wider uppercase transition-all border-b-2 outline-none ${isActive
                                            ? 'text-sky-400 border-sky-400 bg-slate-800'
                                            : isPast
                                                ? 'text-emerald-500 border-transparent hover:text-emerald-400 hover:bg-slate-800/50'
                                                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-sky-400' : isPast ? 'text-emerald-500' : 'text-slate-400'}`} />
                                        {step.label}
                                        {isPhaseCompleted(step.id, platform) && (
                                            <CheckCircle2 className="w-3.5 h-3.5 ml-2 text-emerald-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Save / Load Mission — right side of nav */}
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all p-1">
                                <input
                                    type="text"
                                    value={missionName}
                                    onChange={e => setMissionName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                    placeholder="Mission name…"
                                    className="bg-transparent text-white px-2 py-1.5 text-xs focus:outline-none w-36 placeholder-slate-600 font-mono"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={!missionName.trim()}
                                    className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider transition-colors"
                                >
                                    <Save className="w-3 h-3" /> Save
                                </button>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsLoadMenuOpen(v => !v)}
                                    className="text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-700/50 rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-slate-800 transition-colors"
                                >
                                    <FolderOpen className="w-3 h-3" /> Load
                                </button>
                                {isLoadMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[200] overflow-hidden">
                                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                            <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Saved Missions</h4>
                                            <button onClick={() => setIsLoadMenuOpen(false)} className="text-slate-600 hover:text-slate-300"><X className="w-3 h-3" /></button>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {savedMissions.length === 0 ? (
                                                <div className="p-4 text-center text-slate-500 text-sm italic">No saved missions yet.</div>
                                            ) : (
                                                savedMissions.map((m) => (
                                                    <div key={m.id} className="flex flex-col border-b border-slate-800/50 hover:bg-slate-800 transition-colors">
                                                        <button onClick={e => { e.stopPropagation(); handleLoad(m.items); }} className="w-full text-left px-4 py-3">
                                                            <div className="text-sky-400 font-bold mb-0.5 truncate text-xs">{m.name}</div>
                                                            <div className="text-[10px] text-slate-500">{new Date(m.created_at).toLocaleDateString()} · {m.items.length} modules</div>
                                                        </button>
                                                        <div className="flex justify-end px-4 pb-2">
                                                            <button
                                                                onClick={async e => { e.stopPropagation(); if (confirm('Delete this mission?')) await deleteMission(m.id); }}
                                                                className="text-red-400 hover:text-red-300 text-[10px] uppercase tracking-wider font-bold transition-colors"
                                                            >Delete</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Main Content Area */}
                <div className="flex-1 relative flex flex-col min-h-0">

                    {activeStep === 'drone' && (
                        <div className="flex flex-col h-full">
                            <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center shrink-0">
                                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
                                    {allowedPlatforms.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePlatformChange(p as any)}
                                            className={`px-6 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${platform === p ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                        >
                                            {p === 'multirotor' ? 'Vertical Lift' : p === 'fixed-wing' ? 'Fixed Wing' : 'Rover (UGV)'}
                                            {isPhaseCompleted('drone', p) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 relative flex min-h-0 overflow-hidden">
                                {platform === 'multirotor' ? (
                                    <HeavyLiftSimulator sim={heavyLiftSim} />
                                ) : platform === 'fixed-wing' ? (
                                    <FixedWingSimulator sim={fixedWingSim} />
                                ) : (
                                    <RoverSimulator />
                                )}

                                <div className="absolute inset-0 pointer-events-none z-50">
                                    <div className="absolute bottom-6 right-6 pointer-events-auto">
                                        <button
                                            onClick={() => handlePhaseNavigation('transmission')}
                                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow-xl uppercase tracking-widest text-sm flex items-center gap-2"
                                        >
                                            Next Phase <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 'transmission' && (
                        <div className="w-full h-full relative flex flex-col">
                            {/* Platform Sub-Pills */}
                            <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center shrink-0">
                                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
                                    {allowedPlatforms.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePlatformChange(p as any)}
                                            className={`px-5 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${platform === p ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {p === 'multirotor' ? 'Vertical Lift' : p === 'fixed-wing' ? 'Fixed Wing' : 'Rover (UGV)'}
                                            {isPhaseCompleted('transmission', p) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 relative min-h-0 overflow-hidden">
                                {platform === 'multirotor' && <RobustTransmissionSimulator droneCalcData={activeCalcData} platform={platform} isCommercialEmail={isCommercialEmail} />}
                                {platform === 'fixed-wing' && <FixedWingTransmissionSimulator droneCalcData={activeCalcData} isCommercialEmail={isCommercialEmail} />}
                                {platform === 'rover' && <RoverTransmissionSimulator droneCalcData={activeCalcData} isCommercialEmail={isCommercialEmail} />}
                                <div className="absolute inset-0 pointer-events-none z-50">
                                    <div className="absolute bottom-6 right-6 pointer-events-auto">
                                        <button onClick={() => handlePhaseNavigation('positioning')} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow-xl uppercase tracking-widest text-sm flex items-center gap-2">
                                            Next: Positioning <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 'positioning' && (
                        <div className="w-full h-full relative flex flex-col">
                            {/* Platform Sub-Pills */}
                            <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center shrink-0">
                                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
                                    {allowedPlatforms.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePlatformChange(p as any)}
                                            className={`px-5 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${platform === p ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {p === 'multirotor' ? 'Vertical Lift' : p === 'fixed-wing' ? 'Fixed Wing' : 'Rover (UGV)'}
                                            {isPhaseCompleted('positioning', p) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 relative min-h-0 overflow-hidden">
                                {platform === 'multirotor' && (
                                    <PositioningPhase
                                        onPositioningUpdate={setPositioningResult}
                                        droneCalcData={activeCalcData}
                                        platform={platform}
                                    />
                                )}
                                {platform === 'fixed-wing' && (
                                    <FixedWingPositioningPhase
                                        droneCalcData={activeCalcData}
                                        platform="fixed-wing"
                                    />
                                )}
                                {platform === 'rover' && (
                                    <RoverPositioningPhase
                                        droneCalcData={activeCalcData}
                                        platform="rover"
                                    />
                                )}
                                <div className="absolute bottom-6 right-6 z-[600] flex items-center gap-3 pointer-events-auto">
                                    {positioningResult && (
                                        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2 text-[11px] text-slate-400 font-mono">
                                            Drone↔GCS: <span className="text-sky-400 font-bold">{positioningResult.droneToGcsKm.toFixed(2)} km</span>
                                            &nbsp;|&nbsp; Drone↔Jammer: <span className="text-red-400 font-bold">{positioningResult.droneToJammerKm.toFixed(2)} km</span>
                                        </div>
                                    )}
                                    <button onClick={() => handlePhaseNavigation('architecture')} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-lg shadow-xl uppercase tracking-widest text-sm transition-colors flex items-center gap-2">
                                        Confirm Positions &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 'architecture' && (
                        <ReactFlowProvider>
                            <MissionWiringViewer platform={platform} />
                        </ReactFlowProvider>
                    )}

                    <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
                    <LoginPromptModal isOpen={isLoginPromptOpen} onClose={() => setIsLoginPromptOpen(false)} />
                </div>
            </div>
        </ThemeProvider>
    );
}

export default function MissionArchitect() {
    return (
        <MissionArchitectContent />
    );
}

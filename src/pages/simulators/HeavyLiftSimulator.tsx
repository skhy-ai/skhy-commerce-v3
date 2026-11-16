import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeavyLiftSimulation } from '../../hooks/useHeavyLiftSimulation';
import { HeavyLiftSidebar } from '../../components/simulators/HeavyLift/HeavyLiftSidebar';
import { HeavyLiftCanvas } from '../../components/simulators/HeavyLift/HeavyLiftCanvas';
import { HeavyLiftLoadingOverlay } from '../../components/simulators/HeavyLift/HeavyLiftVisuals';
import { SimulatorTopHUD } from '../../components/simulators/SimulatorTopHUD';

interface HeavyLiftSimulatorProps {
    sim?: any;
}

const HeavyLiftSimulator: React.FC<HeavyLiftSimulatorProps> = ({ sim }) => {
    const localSim = useHeavyLiftSimulation();
    const { state, controls, derived } = sim || localSim;
    const navigate = useNavigate();

    return (
        <div className="bg-slate-800 text-slate-200 h-full w-full overflow-hidden flex flex-col relative">
            <HeavyLiftLoadingOverlay 
                isLoading={state.isLoading} 
                loadingProgress={state.loadingProgress} 
            />

            {/* Full-width HUD Bar */}
            <SimulatorTopHUD 
                title="SKHY Heavy Lift Simulator"
                subtitle="High Performance Logistics & ISR Build"
                metrics={[
                    { label: 'AUW', value: derived.calcData?.totalAUW.toFixed(2) || '0.00', unit: 'kg' },
                    { label: 'Max Thrust', value: derived.calcData?.totalMaxThrust.toFixed(1) || '0.0', unit: 'kg', color: 'text-emerald-400' },
                    { label: 'Hover %', value: derived.calcData?.hoverThrottle.toFixed(1) || '0.0', unit: '%', color: 'text-emerald-400' },
                    { label: 'Range', value: derived.calcData?.rangeKm.toFixed(1) || '0.0', unit: 'km', color: 'text-sky-400' },
                    { label: 'Flight Time', value: derived.calcData ? (derived.calcData.flightTimeHrs * 60).toFixed(0) : '0', unit: 'min', color: 'text-purple-400' },
                    { label: 'Pay. Reserve', value: derived.calcData ? (derived.calcData.totalMaxThrust * 0.7 - derived.calcData.totalAUW).toFixed(2) : '0.00', unit: 'kg', color: 'text-amber-400' }
                ]}
            />

            <div className="flex-1 flex min-h-0 overflow-hidden relative">
                <HeavyLiftSidebar 
                    state={state} 
                    controls={controls} 
                    derived={derived}
                    onNavigate={(path) => navigate(path)}
                />

                <div className="w-1/2 h-full relative overflow-hidden">
                    <HeavyLiftCanvas 
                        frame={derived.frame}
                        prop={derived.prop}
                        motor={derived.motor}
                        payloadMass={state.payloadMass}
                        pipeMatId={state.pipeMatId}
                        camera={state.camera}
                    />
                </div>
            </div>
        </div>
    );
};

export default HeavyLiftSimulator;

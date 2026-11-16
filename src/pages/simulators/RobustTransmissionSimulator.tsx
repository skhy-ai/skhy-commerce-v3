import React, { useState } from 'react';
import { useTransmissionSimulation } from '../../hooks/useTransmissionSimulation';
import { SimulatorTopHUD } from '../../components/simulators/SimulatorTopHUD';
import { TransmissionSidebar } from '../../components/simulators/Transmission/TransmissionSidebar';
import { SimulationCanvas } from '../../components/simulators/Transmission/SimulationCanvas';
import { PhysicsGraph, SimulationOverlay } from '../../components/simulators/Transmission/TransmissionVisuals';
import { CalculationModal, PhysicsHelpModal } from '../../components/simulators/Transmission/TransmissionModals';

interface RobustTransmissionSimulatorProps {
    droneCalcData?: any;
    platform?: 'multirotor' | 'fixed-wing' | 'rover';
    isCommercialEmail?: boolean;
}

const RobustTransmissionSimulator: React.FC<RobustTransmissionSimulatorProps> = ({ droneCalcData = {}, platform, isCommercialEmail }) => {
    const { state, controls, derived } = useTransmissionSimulation(platform || 'multirotor');
    const [showBom, setShowBom] = useState(false);
    const [showCalc, setShowCalc] = useState(false);
    const [showPhysicsHelp, setShowPhysicsHelp] = useState(false);

    return (
        <div className="flex flex-col h-full w-full relative bg-slate-800 text-slate-200 overflow-hidden select-none">
            <SimulatorTopHUD 
                title="Robust Transmission Domain"
                subtitle="Industrial Multi-Band Resiliency"
                metrics={[
                    { label: 'Uplink SIR', value: isFinite(derived.calcData?.up?.sir) ? derived.calcData.up.sir.toFixed(1) : '--', unit: 'dB', color: (derived.calcData?.up?.sir ?? 0) < 0 ? 'text-red-500' : 'text-emerald-400' },
                    { label: 'Downlink SIR', value: isFinite(derived.calcData?.down?.sir) ? derived.calcData.down.sir.toFixed(1) : '--', unit: 'dB', color: (derived.calcData?.down?.sir ?? 0) < 0 ? 'text-red-500' : 'text-sky-400' },
                    { label: 'Range', value: (droneCalcData?.rangeKm || 0).toFixed(1), unit: 'km', color: 'text-sky-400' },
                    ...(platform === 'fixed-wing' ? [
                        { label: 'Cruise Thrust', value: (droneCalcData?.cruiseThrustKg || 0).toFixed(2), unit: 'kg', color: 'text-cyan-400' }
                    ] : []),
                    { label: 'Payload', value: (droneCalcData?.totalPayload || 0).toFixed(2), unit: 'kg', color: 'text-blue-400' }
                ]}
            />

            <div className="flex-1 flex overflow-hidden relative min-h-0">
                <TransmissionSidebar 
                    state={state} 
                    controls={controls} 
                    derived={derived} 
                    showBom={showBom} 
                    setShowBom={setShowBom}
                    droneCalcData={droneCalcData}
                    platform={platform}
                    isCommercialEmail={isCommercialEmail}
                />

                <div className="flex-1 relative bg-slate-700 group">
                    <SimulationCanvas 
                        targetDistKm={state.targetDistKm}
                        altitudeM={state.altitudeM}
                        ctrlDistKm={state.ctrlDistKm}
                        activeBand={derived.activeBand}
                        envFactor={state.envFactor}
                        relayEnabled={state.relayEnabled}
                        relayMode={state.relayMode}
                        relayAltKm={state.relayAltKm}
                        relayOffsetKm={state.relayOffsetKm}
                        relayDepthKm={state.relayDepthKm}
                        calcData={derived.calcData}
                        platform="multirotor"
                        isCommercialEmail={isCommercialEmail}
                    />

                    <SimulationOverlay calcData={derived.calcData} />

                    <PhysicsGraph 
                        chartData={derived.chartData}
                        chartOptions={derived.chartOptions}
                        calcData={derived.calcData}
                        activeBandId={state.activeBandId}
                        relayEnabled={state.relayEnabled}
                        onShowCalc={() => setShowCalc(true)}
                        onShowHelp={() => setShowPhysicsHelp(true)}
                    />
                </div>
            </div>

            <CalculationModal 
                show={showCalc}
                onClose={() => setShowCalc(false)}
                activeBand={derived.activeBand}
                calcData={derived.calcData}
                rcPower={derived.rcPower}
                videoPower={derived.videoPower}
                altitudeM={state.altitudeM}
                relayEnabled={state.relayEnabled}
                relayPower={state.relayPower}
            />

            <PhysicsHelpModal 
                show={showPhysicsHelp}
                onClose={() => setShowPhysicsHelp(false)}
            />
        </div>
    );
};

export default RobustTransmissionSimulator;

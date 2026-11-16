import React from 'react';
import { FixedWingSidebar } from '../../components/simulators/FixedWing/FixedWingSidebar';
import { FixedWingCanvas } from '../../components/simulators/FixedWing/FixedWingCanvas';
import { FixedWingHUD } from '../../components/simulators/FixedWing/FixedWingHUD';
import { SimulatorTopHUD } from '../../components/simulators/SimulatorTopHUD';
import { useFixedWingSimulation } from '../../hooks/useFixedWingSimulation';

// ─── Main Simulator Component ─────────────────────────────────────────────────
interface FixedWingSimulatorProps {
  sim: any;
}

const FixedWingSimulator: React.FC<FixedWingSimulatorProps> = ({ sim }) => {
  const { state, controls, derived } = sim;

  return (
    <div className="flex flex-col h-full w-full bg-slate-800 overflow-hidden relative">
      {/* Full-width HUD Bar */}
      <SimulatorTopHUD 
          title="Skhy Fixed-Wing Simulator"
          subtitle="Long-Range Surveyor Build"
          metrics={[
              { label: 'AUW', value: derived.calcData?.totalAUW.toFixed(2) || '0.00', unit: 'kg' },
              { label: 'Max Thrust', value: derived.calcData?.totalMaxThrust.toFixed(1) || '0.0', unit: 'kg', color: 'text-emerald-400' },
              { label: 'Hover %', value: derived.calcData?.hoverThrottle.toFixed(1) || '0.0', unit: '%', color: 'text-emerald-400' },
              { label: 'Range', value: derived.calcData?.rangeKm.toFixed(1) || '0.0', unit: 'km', color: 'text-sky-400' },
              { label: 'Cruise Thrust', value: derived.calcData?.cruiseThrustKg.toFixed(2) || '0.00', unit: 'kg', color: 'text-cyan-400' },
              { label: 'Flight Time', value: derived.calcData ? (derived.calcData.flightTimeHrs * 60).toFixed(0) : '0', unit: 'min', color: 'text-purple-400' },
              { label: 'Pay. Reserve', value: derived.calcData ? (derived.calcData.totalMaxThrust * 0.7 - derived.calcData.totalAUW).toFixed(2) : '0.00', unit: 'kg', color: 'text-amber-400' }
          ]}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <FixedWingSidebar state={state} controls={controls} derived={derived} />

        {/* ── Viewport ── */}
        <div className="w-1/2 h-full relative overflow-hidden">
            {/* Sky / Aircraft Canvas */}
            <FixedWingCanvas 
                roll={derived.roll} 
                pitch={derived.pitch} 
                throttle={state.throttle} 
                t={state.t} 
                motorCount={state.motorCount}
                wingspan={derived.frame?.wingspan_m || 2.4}
            />
            
            {/* Overlaid HUD / Controls (Transparent layer) */}
            <FixedWingHUD
                ias={derived.ias}
                alt={derived.alt}
                throttle={state.throttle}
                vsi={derived.vsi}
                hdg={derived.hdg}
                setThrottle={controls.setThrottle}
            />
        </div>
      </div>
    </div>
  );
};

export default FixedWingSimulator;

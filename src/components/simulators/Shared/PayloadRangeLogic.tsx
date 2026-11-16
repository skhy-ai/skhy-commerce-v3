import React from 'react';
import { Scale, Zap, Ruler, Info, AlertTriangle, Calculator, ChevronDown, ChevronUp, Battery, Cpu, Wind } from 'lucide-react';

interface PayloadRangeLogicProps {
    totalPayload: number;       // kg — user payload + camera
    payloadReserve: number;     // kg — (T_max×0.7) − AUW
    totalAUW: number;           // kg
    rangeKm: number;
    flightTimeMin: number;      // min
    maxThrust: number;          // kg
    hoverThrottle: number;      // %
    platform?: 'multirotor' | 'fixed-wing' | 'rover';

    // ── Multirotor detail props ──
    frameMass?: number;         // kg
    motorMass?: number;         // kg (all motors combined)
    propMass?: number;          // kg (all props combined)
    escMass?: number;           // kg
    battMass?: number;          // kg
    telemetryMass?: number;     // kg
    gpsMass?: number;           // kg
    hoverPowerW?: number;       // W
    usableWh?: number;          // Wh (80% of battery)
    motorEfficiency?: number;   // g/W
    motorKv?: number;
    motorWattsMax?: number;
    cruiseSpeedKmh?: number;

    // ── Fixed-wing detail props ──
    takeoffThrustKg?: number;
    cruiseThrustKg?: number;
    landingThrustKg?: number;
    glideRatio?: number;
    cruisePowerW?: number;
}

const Row = ({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: 'sky' | 'amber' | 'emerald' | 'purple' | 'red' }) => {
    const colorMap = {
        sky:     'text-sky-400',
        amber:   'text-amber-400',
        emerald: 'text-emerald-400',
        purple:  'text-purple-400',
        red:     'text-red-400',
    };
    return (
        <div className="flex justify-between items-center py-0.5">
            <span className="text-xs text-slate-300 font-medium">{label}</span>
            <span className={`text-xs font-bold font-mono ${highlight ? colorMap[highlight] : 'text-white'}`}>
                {value}{unit ? <span className="text-[10px] text-slate-400 ml-0.5">{unit}</span> : null}
            </span>
        </div>
    );
};

const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
    <div className="bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
        <div className={`px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5 ${color}`}>
            <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        <div className="p-3 space-y-1.5">{children}</div>
    </div>
);

export const PayloadRangeLogic: React.FC<PayloadRangeLogicProps> = ({
    totalPayload = 0,
    payloadReserve = 0,
    totalAUW = 0,
    rangeKm = 0,
    flightTimeMin = 0,
    maxThrust = 0,
    hoverThrottle = 0,
    platform = 'multirotor',
    frameMass = 0,
    motorMass = 0,
    propMass = 0,
    escMass = 0,
    battMass = 0,
    telemetryMass = 0,
    gpsMass = 0,
    hoverPowerW,
    usableWh,
    motorEfficiency,
    motorKv,
    motorWattsMax,
    cruiseSpeedKmh,
    takeoffThrustKg = 0,
    cruiseThrustKg = 0,
    landingThrustKg = 0,
    glideRatio = 0,
    cruisePowerW,
}) => {
    const [showBreakdown, setShowBreakdown] = React.useState(true);
    const isOverweight = hoverThrottle > 75;
    const isCritical   = payloadReserve < 0.2;

    const renderMultirotorBreakdown = () => (
        <div className="space-y-2 pt-3 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            {/* Mass Budget */}
            <Section title="⚖ Mass Budget" color="text-sky-400">
                {frameMass > 0   && <Row label="Airframe"        value={frameMass.toFixed(3)}      unit="kg" />}
                {motorMass > 0   && <Row label="Motors (all)"    value={motorMass.toFixed(3)}      unit="kg" />}
                {propMass > 0    && <Row label="Propellers (all)" value={propMass.toFixed(3)}      unit="kg" />}
                {escMass > 0     && <Row label="ESCs"            value={escMass.toFixed(3)}        unit="kg" />}
                {battMass > 0    && <Row label="Battery"         value={battMass.toFixed(3)}       unit="kg" />}
                {(telemetryMass > 0 || gpsMass > 0) && (
                    <Row label="Avionics (Telem+GPS)" value={(telemetryMass + gpsMass).toFixed(3)} unit="kg" />
                )}
                {totalPayload > 0 && <Row label="Mission Payload" value={totalPayload.toFixed(3)} unit="kg" highlight="amber" />}
                <div className="border-t border-slate-700 pt-1 mt-1">
                    <Row label="Total AUW" value={totalAUW.toFixed(3)} unit="kg" highlight="sky" />
                </div>
            </Section>

            {/* Power & Endurance */}
            <Section title="⚡ Power & Endurance" color="text-purple-400">
                {motorEfficiency != null && (
                    <Row label="Motor Efficiency (η)" value={motorEfficiency.toFixed(1)} unit=" g/W" highlight="purple" />
                )}
                {hoverPowerW != null && (
                    <Row label="Hover Power Draw" value={Math.round(hoverPowerW).toString()} unit=" W" />
                )}
                {usableWh != null && (
                    <Row label="Usable Capacity (80%)" value={usableWh.toFixed(1)} unit=" Wh" />
                )}
                <Row label="Flight Endurance" value={flightTimeMin.toFixed(0)} unit=" min" highlight="emerald" />
                {hoverPowerW != null && usableWh != null && (
                    <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500 leading-relaxed">
                        t = {usableWh.toFixed(1)}Wh / {Math.round(hoverPowerW)}W × 60 = {flightTimeMin.toFixed(0)} min
                        <br />
                        η = AUW({totalAUW.toFixed(2)}kg) × 1000 / {motorEfficiency?.toFixed(1)}(g/W)
                    </div>
                )}
            </Section>

            {/* Range */}
            <Section title="📡 Range Estimate" color="text-emerald-400">
                {cruiseSpeedKmh != null && (
                    <Row label="Cruise Speed" value={cruiseSpeedKmh.toFixed(0)} unit=" km/h" />
                )}
                <Row label="Projected Range" value={rangeKm.toFixed(1)} unit=" km" highlight="emerald" />
                {cruiseSpeedKmh != null && (
                    <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500">
                        R = {cruiseSpeedKmh.toFixed(0)} km/h × {(flightTimeMin / 60).toFixed(2)} h = {rangeKm.toFixed(1)} km
                    </div>
                )}
            </Section>

            {/* Payload Reserve */}
            <Section title="🛡 Payload Reserve" color="text-amber-400">
                <Row label="Max Thrust" value={maxThrust.toFixed(1)} unit=" kg" />
                <Row label="Reserve = (T×0.70) − AUW" value={payloadReserve.toFixed(2)} unit=" kg" highlight={payloadReserve < 0 ? 'red' : 'amber'} />
                <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500">
                    ({maxThrust.toFixed(1)} × 0.70) − {totalAUW.toFixed(2)} = {payloadReserve.toFixed(2)} kg
                    <br />30% thrust margin reserved for manoeuvre & gusts.
                </div>
            </Section>
        </div>
    );

    const renderFixedWingBreakdown = () => (
        <div className="space-y-2 pt-3 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            {/* Mass Budget */}
            <Section title="⚖ Mass Budget" color="text-cyan-400">
                {frameMass > 0  && <Row label="Airframe"       value={frameMass.toFixed(3)}  unit="kg" />}
                {motorMass > 0  && <Row label="Motors"         value={motorMass.toFixed(3)}  unit="kg" />}
                {battMass > 0   && <Row label="Battery"        value={battMass.toFixed(3)}   unit="kg" />}
                {totalPayload > 0 && <Row label="Payload"      value={totalPayload.toFixed(3)} unit="kg" highlight="amber" />}
                <div className="border-t border-slate-700 pt-1 mt-1">
                    <Row label="Total AUW" value={totalAUW.toFixed(3)} unit="kg" highlight="sky" />
                </div>
            </Section>

            {/* Aerodynamics */}
            <Section title="✈ Aerodynamics (Breguet Model)" color="text-sky-400">
                <Row label="Glide Ratio (L/D)"   value={`${glideRatio}:1`} highlight="sky" />
                <Row label="Cruise Thrust (D)"   value={cruiseThrustKg.toFixed(3)} unit=" kg" />
                <Row label="Takeoff Thrust"      value={takeoffThrustKg.toFixed(2)} unit=" kg" highlight="emerald" />
                <Row label="Approach Thrust"     value={landingThrustKg.toFixed(3)} unit=" kg" highlight="amber" />
                {cruisePowerW != null && (
                    <Row label="Cruise Power Draw" value={Math.round(cruisePowerW).toString()} unit=" W" highlight="purple" />
                )}
                <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500 leading-relaxed">
                    D = AUW / (L/D) = {totalAUW.toFixed(2)} / {glideRatio} = {cruiseThrustKg.toFixed(3)} kg
                    <br />
                    P = AUW × g × V / (L/D × η_prop)
                    <br />
                    P = {totalAUW.toFixed(2)} × 9.81 × {cruiseSpeedKmh != null ? (cruiseSpeedKmh / 3.6).toFixed(1) : '?'} / ({glideRatio} × 0.80) ≈ {cruisePowerW != null ? Math.round(cruisePowerW) : '?'} W
                </div>
            </Section>

            {/* Range & Endurance */}
            <Section title="📡 Breguet Range" color="text-emerald-400">
                {usableWh != null && <Row label="Usable Capacity (80%)" value={usableWh.toFixed(1)} unit=" Wh" />}
                {cruisePowerW != null && <Row label="Cruise Power" value={Math.round(cruisePowerW).toString()} unit=" W" />}
                <Row label="Endurance" value={flightTimeMin.toFixed(0)} unit=" min" highlight="purple" />
                <Row label="Range" value={rangeKm.toFixed(1)} unit=" km" highlight="emerald" />
                {cruisePowerW != null && usableWh != null && cruiseSpeedKmh != null && (
                    <div className="mt-1 p-2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-500 leading-relaxed">
                        t = {usableWh.toFixed(1)} / {Math.round(cruisePowerW)} = {(usableWh / cruisePowerW * 60).toFixed(0)} min
                        <br />
                        R = {cruiseSpeedKmh} × {(usableWh / cruisePowerW).toFixed(3)} h = {rangeKm.toFixed(1)} km
                    </div>
                )}
            </Section>
        </div>
    );

    const renderRoverBreakdown = () => (
        <div className="space-y-2 pt-3 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            <Section title="⚡ UGV Power Budget" color="text-sky-400">
                <Row label="Edge AI (TOPS)"    value="67.0" />
                <Row label="Core Logic Draw"   value="25.4" unit=" W" />
                <Row label="Mobility Drain"    value="142.0" unit=" W" />
                <Row label="Total Current"     value={(167.4 / 24).toFixed(1)} unit=" A @ 24V" highlight="sky" />
            </Section>
        </div>
    );

    return (
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-500/10 rounded-lg">
                        <Scale className="w-4 h-4 text-sky-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payload & Range Analysis</h3>
                </div>
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded transition-colors ${showBreakdown ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'}`}
                    title="Toggle Full Breakdown"
                >
                    <Calculator className="w-3.5 h-3.5" />
                    {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Summary Stats */}
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400 uppercase block mb-1 font-bold">Total AUW</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white font-mono">{totalAUW.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 font-bold">kg</span>
                        </div>
                    </div>
                    <div className={`bg-slate-900/50 p-3 rounded-lg border ${isCritical ? 'border-red-500/30' : 'border-slate-800'}`}>
                        <span className="text-xs text-slate-400 uppercase block mb-1 font-bold">Reserve</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-bold font-mono ${payloadReserve < 0 ? 'text-red-400' : 'text-amber-400'}`}>
                                {payloadReserve.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">kg</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-sky-400" />
                            <span className="text-xs text-slate-300 font-medium">Projected Range</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{rangeKm.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-slate-300 font-medium">Flight Endurance</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{flightTimeMin.toFixed(0)} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full ${isOverweight ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            </div>
                            <span className="text-xs text-slate-300 font-medium">
                                {platform === 'fixed-wing' ? 'Cruise Load %' : 'Hover % (Thrust Load)'}
                            </span>
                        </div>
                        <span className={`text-sm font-bold font-mono ${isOverweight ? 'text-red-400' : 'text-emerald-400'}`}>
                            {hoverThrottle.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                {showBreakdown && (
                    platform === 'multirotor' ? renderMultirotorBreakdown() :
                    platform === 'fixed-wing' ? renderFixedWingBreakdown() :
                    renderRoverBreakdown()
                )}

                {/* Footer note */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex gap-3">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        {platform === 'fixed-wing'
                            ? 'Range derived from Breguet equation simplified for electric propulsion. η_prop = 0.80 assumed.'
                            : 'Efficiency (g/W) sourced from motor manufacturer datasheets. 20% battery reserve applied.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

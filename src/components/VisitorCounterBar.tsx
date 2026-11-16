import React, { useEffect, useState } from 'react';
import { Globe, Users } from 'lucide-react';
import { CountryFlag } from './common/CountryFlag';

interface VisitorCount {
    country: string;
    country_code: string;
    count: number;
}

interface VisitorCounterBarProps {
    visitorCounts: VisitorCount[];
    totalVisits: number;
    isLoading: boolean;
    firstVisitDate?: Date | null;
}



/**
 * Animated number counter that counts up from 0 to target.
 */
const AnimatedCount: React.FC<{ target: number; duration?: number }> = ({ target, duration = 1200 }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (target <= 0) { setCurrent(0); return; }

        const startTime = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);

    return <>{current.toLocaleString()}</>;
};

const VisitorCounterBar: React.FC<VisitorCounterBarProps> = ({ visitorCounts, totalVisits, isLoading, firstVisitDate }) => {
    if (isLoading) {
        return (
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700/50 py-4">
                <div className="container mx-auto px-4 flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm font-mono">Loading visitor data...</span>
                </div>
            </div>
        );
    }

    if (visitorCounts.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border-t border-gray-700/40 relative overflow-hidden">
            {/* Subtle animated background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(14,165,233,0.04),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(168,85,247,0.03),transparent_60%)]" />

            <div className="container mx-auto px-4 py-5 relative z-10">
                {/* Header Row */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                            <Globe className="w-4 h-4 text-sky-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[2px] text-gray-400">
                            Global Visits
                        </span>
                    </div>
                    <div className="h-4 w-px bg-gray-700" />
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-lg font-bold font-mono text-white tracking-tight">
                            <AnimatedCount target={totalVisits} />
                        </span>
                        <span className="text-xs text-gray-500 font-medium">total visits</span>
                    </div>
                </div>

                {/* Country Flags Row */}
                <div className="flex items-center justify-center gap-1 flex-wrap">
                    {visitorCounts.map((vc, idx) => (
                        <React.Fragment key={vc.country_code}>
                            <div
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 cursor-default"
                                title={`${vc.country}: ${vc.count} total visits`}
                            >
                                <CountryFlag
                                    countryCode={vc.country_code}
                                    customName={vc.country}
                                    size="sm"
                                />
                                <span className="text-xs font-bold font-mono text-gray-300 group-hover:text-white transition-colors flex items-center gap-1">
                                    <AnimatedCount target={vc.count} duration={800 + idx * 100} />
                                    <span className="text-[10px] text-gray-500 font-normal">visits</span>
                                </span>
                            </div>
                            {idx < visitorCounts.length - 1 && (
                                <span className="text-gray-700 text-xs mx-0.5 hidden sm:inline">·</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Subtle bottom text */}
                <div className="text-center mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">
                        Page visits from {visitorCounts.length} {visitorCounts.length === 1 ? 'country' : 'countries'} worldwide
                    </span>
                    {firstVisitDate && (
                        <>
                            <span className="hidden sm:inline text-gray-700 text-[10px]">•</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                                Tracking since {firstVisitDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisitorCounterBar;

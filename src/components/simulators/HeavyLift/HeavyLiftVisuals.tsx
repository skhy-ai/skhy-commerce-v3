import React from 'react';
import { Loader2 } from 'lucide-react';

interface HeavyLiftLoadingOverlayProps {
    isLoading: boolean;
    loadingProgress: number;
}

export const HeavyLiftLoadingOverlay: React.FC<HeavyLiftLoadingOverlayProps> = ({ isLoading, loadingProgress }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 text-sky-400 mb-8">
                    <Loader2 className="w-16 h-16 animate-spin" />
                    <h2 className="text-2xl font-bold uppercase tracking-widest animate-pulse text-center">Initializing Simulator</h2>
                    <div className="text-slate-400 font-mono text-sm text-center">Loading Industrial Logistics Engine...</div>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                        className="h-full bg-sky-500 transition-all duration-200 ease-out relative"
                        style={{ width: `${loadingProgress}%` }}
                    >
                        <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/30 blur" />
                    </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-500">
                    <span>{Math.round(loadingProgress)}%</span>
                    <span>SYSTEM BOOT</span>
                </div>
            </div>
        </div>
    );
};

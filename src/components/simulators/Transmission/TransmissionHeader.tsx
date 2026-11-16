import { Radio } from 'lucide-react';

export const TransmissionHeader: React.FC = () => {
    return (
        <div className="p-6 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded"><Radio className="w-8 h-8 text-slate-800" /></div>
                <div>
                    <h1 className="text-xl font-bold tracking-wider uppercase text-white">Robust Transmission Domain</h1>
                    <div className="text-[10px] text-slate-400 font-mono">SPEC: Industrial Multi-Band Resiliency</div>
                </div>
            </div>
        </div>
    );
};

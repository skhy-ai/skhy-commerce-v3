import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface ConfigAddedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    itemCount?: number;
    totalPrice?: number;
    platformName?: string;
}

export const ConfigAddedModal: React.FC<ConfigAddedModalProps> = ({
    isOpen,
    onClose,
    title = 'Configuration Build Committed',
    itemCount = 1,
    totalPrice = 0,
    platformName = 'Mission Build'
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div 
                className="bg-slate-900 border border-sky-500/30 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl shadow-sky-950/50 animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
                        <p className="text-xs text-sky-400 font-medium">Added to Cart & {platformName}</p>
                    </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 my-5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Selected Components:</span>
                        <span className="text-white font-bold font-mono">{itemCount} items</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Total Build Price:</span>
                        <span className="text-sky-400 font-bold font-mono text-base">${totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>All components validated & locked for full system procurement.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all text-center"
                    >
                        Continue Building
                    </button>

                    <button
                        onClick={() => {
                            onClose();
                            navigate('/checkout');
                        }}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 transition-all flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

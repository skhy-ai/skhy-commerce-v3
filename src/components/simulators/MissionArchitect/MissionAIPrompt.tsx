import React, { useState } from 'react';
import { Terminal, Sparkles, Send, Loader2, Info, ArrowRight, ShoppingCart, Package } from 'lucide-react';
import { generateMissionConfig, AIMissionResponse } from '../../../services/aiMissionService';
import { useMissionState } from '../../../contexts/MissionStateContext';
import { useMarketplace } from '../../../hooks/useMarketplace';
import { useCart } from '../../../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { FRAMES, MOTORS, BATTERIES, ESCS, PROPS } from '../../../data/droneComponents';
import { getMarketplaceProductId } from '../../../data/componentIdMap';

interface MissionAIPromptProps {
    onComplete: (platform: 'multirotor' | 'fixed-wing' | 'rover', env: string, presetId?: string) => void;
}

const HINTS = [
    { label: "Night Surveillance", text: "I need a silent fixed-wing drone for 2-hour night surveillance in a mountainous region. High-resolution thermal camera required." },
    { label: "Urban Heavy Lift", text: "Need to transport a 5kg payload in a dense urban environment with potential RF interference. Multirotor preferred." },
    { label: "Deep Recon", text: "Long-range reconnaissance mission in a hostile jamming environment. Must stay airborne for as long as possible." },
    { label: "Industrial Survey", text: "Standard surveying of a construction site. No specific threats, just need high efficiency." }
];

export const MissionAIPrompt: React.FC<MissionAIPromptProps> = ({ onComplete }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<AIMissionResponse['topOptions'] | null>(null);
    const [explanation, setExplanation] = useState<string>('');
    const { updateMultirotor, updateFixedWing } = useMissionState();
    const { products } = useMarketplace();
    const { addToCart } = useCart();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setOptions(null);
        try {
            const response: AIMissionResponse = await generateMissionConfig(prompt);
            setOptions(response.topOptions);
            setExplanation(response.explanation);
            toast.success("Tactical options generated!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to generate mission profile");
        } finally {
            setLoading(false);
        }
    };

    const selectOption = (option: AIMissionResponse['topOptions'][0]) => {
        if (option.platform === 'multirotor') {
            updateMultirotor(option.updates);
        } else if (option.platform === 'fixed-wing') {
            updateFixedWing(option.updates);
        }
        
        onComplete(option.platform, 'both', option.updates?.templateId); // Pass templateId as preset

        toast.success(`Activated ${option.name} configuration`);
    };

    const handleQuickAddCart = (option: AIMissionResponse['topOptions'][0]) => {
        const components = getOptionComponents(option);
        if (components.length === 0) {
            toast.error("No components found for this configuration");
            return;
        }
        components.forEach(item => {
            if (!item) return;
            // Use the numeric marketplace product_id if available, else the string simId
            const cartId = item._marketplaceId ?? item.id;
            addToCart(cartId, 1, item);
        });
        toast.success(`${components.length} components added to cart!`);
    };

    const getOptionComponents = (option: AIMissionResponse['topOptions'][0]) => {
        if (!option.updates) return [];
        const components: any[] = [];
        
        const addComponent = (simId: string | undefined, source: any, type: string) => {
            if (!simId) return;

            // 1. Try direct lookup via COMPONENT_ID_MAP → real marketplace product_id
            const marketplaceId = getMarketplaceProductId(simId);
            if (marketplaceId) {
                const realProduct = products.find(p => Number(p.id) === marketplaceId);
                if (realProduct) {
                    components.push({ ...realProduct, _marketplaceId: marketplaceId });
                    return;
                }
            }

            // 2. Fallback: look up component in local simulator data catalog
            const item = Array.isArray(source) ? source.find((s: any) => s.id === simId) : source[simId];
            if (item) {
                const localItem = {
                    id: simId,
                    _marketplaceId: marketplaceId,
                    name: item.name || item.desc || simId,
                    base_price: item.price || 0,
                    image_url: item.imageUrl,
                    fallback_url: item.imageUrl,
                    description: item.desc || item.name || type,
                    category: 'Drone Components',
                    seller_name: 'SKHY OEM',
                    stock_quantity: 99
                };
                components.push(localItem);
            }
        };

        addComponent(option.updates.frameId, FRAMES, 'Frame');
        addComponent(option.updates.motorId, MOTORS, 'Motor');
        addComponent(option.updates.battId, BATTERIES, 'Battery');
        addComponent(option.updates.escId, ESCS, 'ESC');
        addComponent(option.updates.propId, PROPS, 'Propeller');
        if (option.updates.payload) {
            addComponent(option.updates.payload, {}, 'Payload');
        }

        return components;
    };

    return (

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-sky-500/20 p-1.5 rounded-lg">
                        <Terminal className="w-4 h-4 text-sky-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Mission Descriptor</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    POWERED BY GEMINI 1.5 FLASH
                </div>
            </div>

            <div className="p-6 space-y-6">
                {!options ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Theatrical Context</label>
                            <div className="relative group">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your operational requirements, environmental hazards, and mission objectives..."
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all font-mono resize-none shadow-inner"
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || !prompt.trim()}
                                        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-900/20"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-3 h-3" />
                                                Initialize
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">
                                <Info className="w-3 h-3" />
                                Quick Templates
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {HINTS.map((hint, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPrompt(hint.text)}
                                        className="text-left p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 transition-all group"
                                    >
                                        <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1 group-hover:text-sky-300">{hint.label}</div>
                                        <div className="text-[10px] text-slate-500 line-clamp-1 italic">{hint.text}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {options.map((option, idx) => {
                                const components = getOptionComponents(option);
                                const totalPrice = components.reduce((sum, item) => sum + (item.base_price || 0), 0);

                                return (
                                    <div key={idx} className="relative flex flex-col p-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/40 transition-all group overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                            {option.suitabilityScore}% Match
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{option.platform}</div>
                                        <div className="text-sm font-bold text-white mb-3">{option.name}</div>
                                        
                                        {/* Components List */}
                                        <div className="mb-4 flex-1 space-y-1 overflow-y-auto max-h-[120px] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                                            {components.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-800/50 last:border-0">
                                                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                                                        <Package className="w-3 h-3 text-slate-500 shrink-0" />
                                                        <span className="truncate" title={item.name}>{item.name}</span>
                                                    </div>
                                                    <span className="text-emerald-400 font-mono ml-2 shrink-0">${item.base_price?.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            {components.length === 0 && (
                                                <div className="text-[10px] text-slate-500 italic py-2">Components not found in marketplace</div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-3 border-t border-slate-800/50 pt-2">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Base Cost</span>
                                            <span className="text-sm text-emerald-400 font-mono font-bold">${totalPrice.toFixed(2)}</span>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => handleQuickAddCart(option)}
                                                disabled={components.length === 0}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Add components directly to cart"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Quick Buy</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => selectOption(option)}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/40 transition-colors group-hover:bg-sky-500 group-hover:text-white"
                                                title="Open in Simulator"
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Builder</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tactical Insight</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">"{explanation}"</p>
                        </div>

                        <button 
                            onClick={() => setOptions(null)}
                            className="w-full py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] hover:text-slate-300 transition-colors"
                        >
                            ← Back to Descriptor
                        </button>
                    </div>
                )}
            </div>

            {loading && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin mx-auto" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em] animate-pulse">Scanning Theater...</div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Compiling physics-driven BOM</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
